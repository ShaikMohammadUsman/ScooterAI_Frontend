import { BlockBlobClient, BlobServiceClient } from "@azure/storage-blob";
import { InteractiveBrowserCredential } from "@azure/identity";

export interface ChunkedUploaderConfig {
  userId: string;
  fileExtension: string; // e.g., 'mp4', 'webm' (dot will be added automatically)
  resetCount?: number; // Defaults to 1 if not provided. Used in filename: {user_id}_video_{reset_count}{file_extension}
  onProgress?: (uploadedBytes: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (blobUrl: string) => void;
}

export interface ChunkMeta {
  idBase64: string;
  size: number;
  index: number;
}

export class AzureChunkedUploader {
  private client: BlockBlobClient | null = null;
  private staged: ChunkMeta[] = [];
  private inFlight = 0;
  private queue: Blob[] = [];
  private nextIndex = 0;
  private aborted = false;
  private maxConcurrency = 3; // Conservative for mobile networks
  private uploadedBytes = 0;
  private config: ChunkedUploaderConfig;
  private blobName: string;
  private containerName: string;
  private storageAccount: string;

  constructor(config: ChunkedUploaderConfig) {
    this.config = config;
    this.containerName = process.env.NEXT_PUBLIC_CONTAINER_NAME || '';
    this.storageAccount = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT || '';
    
    // Format filename as requested: {user_id}_video_{reset_count}{file_extension}
    // Ensure file extension starts with a dot
    const fileExt = config.fileExtension.startsWith('.') ? config.fileExtension : `.${config.fileExtension}`;
    const resetCount = config.resetCount ?? 1; // Default to 1 if not provided
    this.blobName = `${config.userId}_video_${resetCount}${fileExt}`;
    
    // console.log('AzureChunkedUploader initialized:', {
    //   userId: config.userId,
    //   originalFileExtension: config.fileExtension,
    //   correctedFileExtension: fileExt,
    //   resetCount: resetCount,
    //   blobName: this.blobName,
    //   containerName: this.containerName,
    //   storageAccount: this.storageAccount,
    //   hasSasUrl: !!process.env.NEXT_PUBLIC_AZURE_CONTAINER_SAS_URL,
    //   hasAadCreds: !!(process.env.NEXT_PUBLIC_AZURE_TENANT_ID && process.env.NEXT_PUBLIC_AZURE_CLIENT_ID)
    // });
    
    this.validateConfig();
  }

  private validateConfig() {
    console.log('Validating configuration...');
    // console.log('Environment variables:', {
    //   NEXT_PUBLIC_CONTAINER_NAME: process.env.NEXT_PUBLIC_CONTAINER_NAME,
    //   NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT: process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT,
    //   NEXT_PUBLIC_AZURE_CONTAINER_SAS_URL: process.env.NEXT_PUBLIC_AZURE_CONTAINER_SAS_URL ? 'SET' : 'NOT SET',
    //   NEXT_PUBLIC_AZURE_TENANT_ID: process.env.NEXT_PUBLIC_AZURE_TENANT_ID ? 'SET' : 'NOT SET',
    //   NEXT_PUBLIC_AZURE_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ? 'SET' : 'NOT SET'
    // });
    
    if (!this.containerName) {
      throw new Error('NEXT_PUBLIC_CONTAINER_NAME is required');
    }
    if (!this.storageAccount) {
      throw new Error('NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT is required');
    }
    if (!this.config.userId) {
      throw new Error('userId is required');
    }
    if (!this.config.fileExtension) {
      throw new Error('fileExtension is required');
    }
    
    // Check if we have at least one authentication method
    const hasSasUrl = !!process.env.NEXT_PUBLIC_AZURE_CONTAINER_SAS_URL;
    const hasAadCreds = !!(process.env.NEXT_PUBLIC_AZURE_TENANT_ID && process.env.NEXT_PUBLIC_AZURE_CLIENT_ID);
    
    if (!hasSasUrl && !hasAadCreds) {
      throw new Error('Either NEXT_PUBLIC_AZURE_CONTAINER_SAS_URL or AAD credentials (NEXT_PUBLIC_AZURE_TENANT_ID + NEXT_PUBLIC_AZURE_CLIENT_ID) are required');
    }
    
    console.log('Configuration validation passed');
  }

  private async initializeClient(): Promise<void> {
    if (this.client) return;

    try {
      // Try SAS URL first (simpler and more reliable for browser)
      const sasUrl = process.env.NEXT_PUBLIC_AZURE_CONTAINER_SAS_URL;
      if (sasUrl) {
        // Validate SAS URL format
        try {
          new URL(sasUrl);
          console.log('SAS URL validation passed');
        } catch (urlError) {
          throw new Error(`Invalid SAS URL format`);
        }
        
        // Use BlobServiceClient approach (more reliable for SAS URLs)
        const blobServiceClient = new BlobServiceClient(sasUrl);
        const containerClient = blobServiceClient.getContainerClient(this.containerName);
        this.client = containerClient.getBlockBlobClient(this.blobName);
        console.log('BlockBlobClient created via BlobServiceClient successfully');
        return;
      }

      // Fallback to AAD authentication
      const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
      const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
      
      if (!tenantId || !clientId) {
        throw new Error('Either SAS URL or AAD credentials (tenant ID + client ID) are required');
      }

      const credential = new InteractiveBrowserCredential({
        tenantId,
        clientId,
        redirectUri: window.location.origin,
      });

      const blobUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}/${this.blobName}`;
      console.log('Initializing BlockBlobClient with AAD URL:', blobUrl);
      this.client = new BlockBlobClient(blobUrl, credential);
    } catch (error) {
      console.error('Failed to initialize Azure client:', error);
      throw new Error(`Failed to initialize Azure client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private makeBlockId(index: number): string {
    // Create a fixed-width base64 block ID for proper ordering
    const paddedIndex = String(index).padStart(16, '0');
    return btoa(paddedIndex);
  }

  async enqueueChunk(blob: Blob): Promise<void> {
    if (this.aborted) return;
    
    try {
      if (!this.client) {
        await this.initializeClient();
      }

      this.queue.push(blob);
      this.pump();
    } catch (error) {
      console.error('Failed to enqueue chunk:', error);
      this.config.onError?.(new Error(`Failed to initialize uploader: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  private pump(): void {
    while (this.inFlight < this.maxConcurrency && this.queue.length > 0 && !this.aborted) {
      const blob = this.queue.shift()!;
      const idBase64 = this.makeBlockId(this.nextIndex++);
      this.inFlight++;
      
      this.stageWithRetry(idBase64, blob, this.nextIndex - 1)
        .finally(() => {
          this.inFlight--;
          this.pump();
        });
    }
  }

  private async stageWithRetry(idBase64: string, blob: Blob, index: number, attempt = 0): Promise<void> {
    const maxAttempts = 5;
    const baseDelay = 1000; // Start with 1 second
    
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      await this.client.stageBlock(idBase64, blob, blob.size);
      
      this.staged.push({ idBase64, size: blob.size, index });
      this.uploadedBytes += blob.size;
      
      this.config.onProgress?.(this.uploadedBytes);
      
    } catch (error) {
      console.warn(`Stage block attempt ${attempt + 1} failed:`, error);
      
      if (attempt + 1 >= maxAttempts) {
        this.config.onError?.(new Error(`Failed to upload chunk after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`));
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt), 30000) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.stageWithRetry(idBase64, blob, index, attempt + 1);
    }
  }

  async finalize(): Promise<string> {
    if (this.aborted) {
      throw new Error('Upload was aborted');
    }

    // Wait for all in-flight uploads to complete
    while (this.inFlight > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.client) {
      throw new Error('Client not initialized');
    }

    if (this.staged.length === 0) {
      throw new Error('No chunks were uploaded');
    }

    try {
      // Sort by index to ensure proper order
      const sortedBlocks = this.staged.sort((a, b) => a.index - b.index);
      const blockList = sortedBlocks.map(block => block.idBase64);
      
      await this.client.commitBlockList(blockList);
      
      const blobUrl = `https://${this.storageAccount}.blob.core.windows.net/${this.containerName}/${this.blobName}`;
      this.config.onComplete?.(blobUrl);
      
      return blobUrl;
    } catch (error) {
      console.error('Failed to finalize upload:', error);
      throw new Error(`Failed to finalize upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async abort(): Promise<void> {
    this.aborted = true;
    this.queue = [];
    // Note: We don't clean up staged blocks as they're already committed to Azure
    // The blob will remain incomplete until explicitly cleaned up
  }

  getUploadedBytes(): number {
    return this.uploadedBytes;
  }

  getStagedChunksCount(): number {
    return this.staged.length;
  }

  isAborted(): boolean {
    return this.aborted;
  }
}

// Utility function to create uploader instance
export function createChunkedUploader(config: ChunkedUploaderConfig): AzureChunkedUploader {
  return new AzureChunkedUploader(config);
}
