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

export interface HiringManager {
    manager_id: string;
    first_name: string;
    last_name: string;
}

export interface BaseSalary {
    currency: string;
    minSalary: number;
    maxSalary: number;
    cadence: string;
}

export interface Job {
    job_id: string;
    job_title: string;
    company_name: string;
    role_type: string;
    primary_focus: string[];
    sales_process_stages: string[];
    min_experience: number;
    max_experience: number;
    skills_required: string[];
    work_location: string;
    locations: string[];
    time_zones: string[];
    base_salary: BaseSalary;
    ote: string[];
    opportunities: string[];
    languages: string[];
    created_at: string;
    hiring_manager: HiringManager;
}

export interface JobDetailsResponse {
    status: boolean;
    message: string;
    job: Job;
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

// User account types
export interface CreateUserAccountRequest {
    email: string;
    number: string;
    name: string;
}

export interface CreateUserAccountResponse {
    status: boolean;
    message: string;
    user_id: string;
}

export interface UserLoginRequest {
    email: string;
}

export interface UserLoginResponse {
    status: boolean;
    message: string;
    account_id?: string;
    data: {
        email: string;
        name: string;
        phone: string;
        last_application_id?: string;
        audio_interview_attended?: boolean;
    };
    job_data?: {
        job_id: string;
        job_title: string;
        job_description: string;
    };
}

export interface UserData {
    email: string;
    name: string;
    phone: string;
    application_ids: string[];
}

// API base URL
const API_BASE = "https://scooter-backend-prod.thankfulwater-944fb792.centralindia.azurecontainerapps.io";
// const API_BASE = "https://scooter-test.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";



/**
 * Logs in a user with email to check for previous applications
 * @param email - User's email address
 * @returns Promise with the login response including user data and job information
 */
export async function userLogin(email: string): Promise<UserLoginResponse> {
    try {
        const response = await axios.post(`${API_BASE}/user-login/`, { email }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to login user");
    }
}


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
export async function getJobById(jobId: string): Promise<JobDetailsResponse> {
    try {
        const response = await axios.get(`${API_BASE}/job/${jobId}`);
        return response.data;
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

/**
 * Creates a new user account
 * @param userData - Object containing user account details
 * @returns Promise with the account creation response
 */
export async function createUserAccount(userData: CreateUserAccountRequest): Promise<CreateUserAccountResponse> {
    try {
        const response = await axios.post(`${API_BASE}/create-user-account/`, userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to create user account");
    }
} 

// ---------------------------------------------------------------------------------------------
// Support Ticket

export interface SubmitSupportTicketRequest {
    name: string;
    email: string;
    phonenumber: string;
    description: string;
    screenshot?: File | Blob | null;
}

export interface SubmitSupportTicketResponse {
    status?: boolean;
    message?: string;
    ticket_id?: string;
}

// The submit-ticket endpoint currently lives on the test cluster per product requirement
// const TICKET_API_BASE = "https://scooter-test.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";

export async function submitSupportTicket(data: SubmitSupportTicketRequest): Promise<SubmitSupportTicketResponse> {
    try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phonenumber', data.phonenumber);
        formData.append('description', data.description);
        if (data.screenshot) {
            const fileName = (data as any).screenshot?.name || 'screenshot.png';
            formData.append('screenshot', data.screenshot, fileName);
        }

        const response = await axios.post(`${API_BASE}/submit-ticket/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.detail || err.response?.data?.message || 'Failed to submit support ticket');
    }
}