import axios, { AxiosError } from 'axios';

// Base URLs
const BASE_URL = 'https://scooter-backend-prod.thankfulwater-944fb792.centralindia.azurecontainerapps.io';

// Storage keys
const SUPER_ADMIN_AUTH_STORAGE_KEY = 'super_admin_auth';

// Types
export interface SuperAdminLoginRequest {
    email: string;
    password: string;
}

export interface SuperAdminData {
    first_name: string;
    last_name: string;
    email: string;
}

export interface SuperAdminAuthResponse {
    status: boolean;
    message: string;
    data?: SuperAdminData;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
}

export interface SuperAdminResetPasswordRequest {
    email: string;
}

export interface SuperAdminResetPasswordResponse {
    status: boolean;
    message: string;
}

export interface SuperAdminSetPasswordRequest {
    email: string;
    otp: string;
    new_password: string;
}

export interface SuperAdminSetPasswordResponse {
    status: boolean;
    message: string;
}

export interface JobDetails {
    title: string;
    moved_to_video_round_count: number;
    audio_attended_count: number;
    video_attended_count: number;
    candidate_count: number;
}

export interface Filters {
    audio_attended: boolean | null;
    video_attended: boolean | null;
    application_status: string | null;
}

export interface Pagination {
    current_page: number;
    page_size: number;
    total_candidates: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface BasicInformation {
    full_name: string;
    current_location: string;
    open_to_relocation: boolean;
    work_preference: string;
    phone_number: string;
    linkedin_url: string;
    email: string;
    specific_phone_number: string | null;
    notice_period: string;
    current_ctc: {
        currencyType: string;
        value: number;
    };
    expected_ctc: {
        currencyType: string;
        value: number;
    };
}

export interface CompanyHistory {
    company_name: string;
    position: string;
    start_date: string;
    end_date: string;
    duration_months: number;
    is_current: boolean;
}

export interface CareerOverview {
    total_years_experience: number;
    years_sales_experience: number;
    average_tenure_per_role: number;
    employment_gaps: {
        has_gaps: boolean;
        duration: string;
    };
    promotion_history: boolean;
    company_history: CompanyHistory[];
}

export interface SalesContext {
    sales_type: string;
    sales_motion: string;
    industries_sold_into: string[];
    regions_sold_into: string[];
    buyer_personas: string[];
}

export interface RoleProcessExposure {
    sales_role_type: string;
    position_level: string;
    sales_stages_owned: string[];
    average_deal_size: string;
    sales_cycle_length: string;
    own_quota: boolean;
    quota_ownership: string[];
    quota_attainment: string;
}

export interface ToolsPlatforms {
    crm_tools: string[];
    crm_used: string | null;
    sales_tools: string[];
}

export interface InterviewStatus {
    audio_interview_passed: boolean;
    video_interview_attended: boolean;
    audio_interview_attended: boolean;
    video_email_sent: boolean;
    video_interview_url: string | null;
    processed_video_url: string;
    audio_interview_url: string | null;
    resume_url_from_user_account: string;
}

export interface Candidate {
    application_id: string;
    profile_created_at: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    professional_summary: string;
    basic_information: BasicInformation;
    career_overview: CareerOverview;
    sales_context: SalesContext;
    role_process_exposure: RoleProcessExposure;
    tools_platforms: ToolsPlatforms;
    resume_url: string;
    application_status: string;
    final_shortlist: boolean;
    call_for_interview: boolean;
    interview_status: InterviewStatus;
    audio_interview_details?: any;
    audio_proctoring_details?: any;
}

export interface JobCandidatesResponse {
    status: boolean;
    message: string;
    job_details: JobDetails;
    filters: Filters;
    pagination: Pagination;
    candidates: Candidate[];
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
    min_experience: number | string;
    max_experience: number | string;
    skills_required: string[];
    work_location: string;
    locations: string[];
    time_zones: string[];
    base_salary: BaseSalary | {};
    ote: string[];
    opportunities: string[];
    languages: string[];
    created_at: string;
    hiring_manager: HiringManager;
}

export interface JobsPagination {
    current_page: number;
    page_size: number;
    total_jobs: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface AllJobsResponse {
    status: boolean;
    message: string;
    pagination: JobsPagination;
    jobs: Job[];
}

// Auth helpers
export function getStoredSuperAdminAuth(): SuperAdminAuthResponse | null {
    try {
        const raw = localStorage.getItem(SUPER_ADMIN_AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setStoredSuperAdminAuth(payload: SuperAdminAuthResponse | null): void {
    if (!payload) {
        localStorage.removeItem(SUPER_ADMIN_AUTH_STORAGE_KEY);
        // Dispatch custom event for auth state change
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('superAdminAuthChanged', { detail: { authenticated: false } }));
        }
        return;
    }
    localStorage.setItem(SUPER_ADMIN_AUTH_STORAGE_KEY, JSON.stringify(payload));
    // Dispatch custom event for auth state change
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('superAdminAuthChanged', { detail: { authenticated: true } }));
    }
}

export function getSuperAdminAccessToken(): string {
    const auth = getStoredSuperAdminAuth();
    return auth?.access_token || '';
}

export function getSuperAdminData(): SuperAdminData | null {
    const auth = getStoredSuperAdminAuth();
    return auth?.data || null;
}

export function isSuperAdminAccessTokenValid(): boolean {
    const token = getSuperAdminAccessToken();
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1] || '')) as { exp?: number };
        if (!payload?.exp) return false;
        const nowSec = Math.floor(Date.now() / 1000);
        return payload.exp > nowSec;
    } catch {
        return false;
    }
}

// Axios instance with interceptors for auth and token refresh
const superAdminApi = axios.create({ baseURL: BASE_URL });

superAdminApi.interceptors.request.use((config) => {
    // Check if we have a valid token before making any request
    if (!isSuperAdminAccessTokenValid()) {
        // Clear any stored auth data
        clearSuperAdminAuth();
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
        }
        // Reject the request
        return Promise.reject(new Error('No valid authentication token found. Redirecting to login.'));
    }

    const token = getSuperAdminAccessToken();
    if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    // default content type for JSON
    if (!(config.headers as any)['Content-Type']) {
        (config.headers as any)['Content-Type'] = 'application/json';
    }
    return config;
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];

function processQueue(error: any, token: string | null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve(token);
        }
    });
    pendingQueue = [];
}

superAdminApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;
        const status = error.response?.status;
        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                            resolve(superAdminApi(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const current = getStoredSuperAdminAuth();
                const rt = current?.refresh_token;
                if (!rt) throw error;
                const refreshRes = await axios.post(`${BASE_URL}/refresh-access-token/`, { refresh_token: rt }, { headers: { 'Content-Type': 'application/json' } });
                const newToken = (refreshRes.data as any)?.access_token;
                if (!newToken) throw error;
                const updated = { ...(current as any), access_token: newToken, token_type: (refreshRes.data as any)?.token_type, status: true };
                setStoredSuperAdminAuth(updated);
                processQueue(null, newToken);
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                return superAdminApi(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                // clear stored auth on failure
                clearSuperAdminAuth();
                // Redirect to login page when refresh fails
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login';
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// API functions
export async function superAdminLogin(data: SuperAdminLoginRequest): Promise<SuperAdminAuthResponse> {
    const res = await axios.post(`${BASE_URL}/admin-login/`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
    const payload: SuperAdminAuthResponse = res.data;
    if (payload?.status && payload?.access_token) {
        setStoredSuperAdminAuth(payload);
    }
    return payload;
}

export async function superAdminResetPassword(data: SuperAdminResetPasswordRequest): Promise<SuperAdminResetPasswordResponse> {
    const res = await axios.post(`${BASE_URL}/admin-reset-password/`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
}

export async function superAdminSetPassword(data: SuperAdminSetPasswordRequest): Promise<SuperAdminSetPasswordResponse> {
    const res = await axios.post(`${BASE_URL}/admin-set-password/`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
}

export async function getJobCandidates(jobId: string, page: number = 1, pageSize: number = 10): Promise<JobCandidatesResponse> {
    const res = await superAdminApi.get(`/job-candidates/${jobId}?page=${page}&page_size=${pageSize}`);
    return res.data;
}

export async function getAllJobs(page: number = 1, pageSize: number = 5): Promise<AllJobsResponse> {
    const res = await superAdminApi.get(`/all-jobs?page=${page}&page_size=${pageSize}`);
    return res.data;
}

// Utility to clear stored auth (e.g., on logout)
export function clearSuperAdminAuth(): void {
    setStoredSuperAdminAuth(null);
}
