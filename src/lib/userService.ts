import axios from "axios";

// Types for the API response
export interface Company {
    company_id: string;
    company_name: string;
    email: string;
    contact_number: string;
    description: string;
    address: string;
}

export interface Job {
    job_id: string;
    title: string;
    description: string;
    badges: string[];
    created_at: string;
    company: Company;
}

export interface PaginationInfo {
    current_page: number;
    page_size: number;
    total_jobs: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface JobsResponse {
    status: boolean;
    message: string;
    pagination: PaginationInfo;
    jobs: Job[];
}

// API base URL
const API_BASE = "https://scooter-backend.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";

/**
 * Fetches a paginated list of jobs
 * @param page - The page number to fetch (1-based)
 * @param pageSize - Number of jobs per page
 * @returns Promise with the jobs response including pagination info
 */
export async function getAllJobs(page: number = 1, pageSize: number = 10): Promise<JobsResponse> {
    try {
        const response = await axios.get(`${API_BASE}/all-jobs`, {
            params: {
                page,
                page_size: pageSize
            }
        });
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to fetch jobs");
    }
}

/**
 * Fetches a single job by ID
 * @param jobId - The ID of the job to fetch
 * @returns Promise with the job details
 */
export async function getJobById(jobId: string): Promise<Job> {
    try {
        const response = await axios.get(`${API_BASE}/job/${jobId}`);
        return response.data.job;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to fetch job details");
    }
}

/**
 * Fetches jobs with optional filters
 * @param filters - Object containing filter parameters
 * @param page - The page number to fetch (1-based)
 * @param pageSize - Number of jobs per page
 * @returns Promise with the filtered jobs response
 */
export interface JobFilters {
    title?: string;
    location?: string;
    company?: string;
    badges?: string[];
    minExperience?: number;
    maxExperience?: number;
}

export async function searchJobs(
    filters: JobFilters = {},
    page: number = 1,
    pageSize: number = 10
): Promise<JobsResponse> {
    try {
        const response = await axios.get(`${API_BASE}/search-jobs`, {
            params: {
                ...filters,
                page,
                page_size: pageSize
            }
        });
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to search jobs");
    }
}

/**
 * Fetches jobs recommended for a user based on their profile
 * @param profileId - The user's profile ID
 * @param page - The page number to fetch (1-based)
 * @param pageSize - Number of jobs per page
 * @returns Promise with the recommended jobs response
 */
export async function getRecommendedJobs(
    profileId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<JobsResponse> {
    try {
        const response = await axios.get(`${API_BASE}/recommended-jobs`, {
            params: {
                profile_id: profileId,
                page,
                page_size: pageSize
            }
        });
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to fetch recommended jobs");
    }
} 