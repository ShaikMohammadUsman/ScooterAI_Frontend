import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Function to set item with expiry
export function setItemWithExpiry(key:string, value:string, ttl=86400000) {
  const now = new Date();

  // The `ttl` (time to live) is in milliseconds
  const item = {
      value: value,
      expiry: now.getTime() + ttl
  };

  localStorage.setItem(key, JSON.stringify(item));
}

// Function to get item with expiry
export function getItemWithExpiry(key:string) {
  const itemStr = localStorage.getItem(key);

  // If the item doesn't exist, return null
  if (!itemStr) {
      return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  // Compare the expiry time with the current time
  if (now.getTime() > item.expiry) {
      // If the item has expired, remove it from storage and return null
      localStorage.removeItem(key);
      return null;
  }

  return item.value;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Redirect URL utilities
export function storeRedirectUrl(url: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('redirect_after_login', url);
    }
}

export function getRedirectUrl(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('redirect_after_login');
    }
    return null;
}

export function clearRedirectUrl(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('redirect_after_login');
    }
}

export function getCurrentUrlWithQuery(): string {
    if (typeof window !== 'undefined') {
        return window.location.pathname + window.location.search;
    }
    return '';
}

// JobId tracking utilities
export function storeJobId(jobId: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('pending_job_application', jobId);
    }
}

export function getStoredJobId(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('pending_job_application');
    }
    return null;
}

export function clearStoredJobId(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('pending_job_application');
    }
}

export function getJobIdFromUrl(searchParams: URLSearchParams | null): string | null {
    if (searchParams) {
        return searchParams.get('job_id');
    }
    return null;
}

