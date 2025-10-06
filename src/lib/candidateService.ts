import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { storeRedirectUrl, getCurrentUrlWithQuery } from './utils';

// Base URLs
const BASE_URL = 'https://scooter-backend-prod.thankfulwater-944fb792.centralindia.azurecontainerapps.io';

// Storage keys
const CANDIDATE_AUTH_STORAGE_KEY = 'candidate_auth';

// Types
export interface CandidateSignupRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    canidate_source: string;
    linkedin_profile: string;
}

export interface CandidateLoginRequest {
    email: string;
    password: string;
}

export interface ApplicationHistory {
    application_id: string;
    job_role_name: string;
    application_status: string;
    video_interview_start: boolean;
    video_email_sent: boolean;
    audio_interview_status: boolean;
}

export interface CandidateProfileData {
    candidate_id: string;
    name: string;
    email: string;
    application_history: ApplicationHistory[];
}

export interface CandidateAuthResponse {
    status: boolean;
    message: string;
    data?: CandidateProfileData;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    candidate_id?: string; // present on signup
}

export interface RefreshAccessTokenRequest {
    refresh_token: string;
}

export interface RefreshAccessTokenResponse {
    status: boolean;
    message: string;
    access_token?: string;
    token_type?: string;
}

export interface ParseResumeRequest {
    name: string;
    email: string;
    phone: string;
    file: File;
}

export interface BasicInformation {
    full_name: string;
    current_location: string;
    open_to_relocation: boolean;
    work_preference?: string;
    phone_number: string;
    linkedin_url: string;
    email: string;
    specific_phone_number: string;
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
    sales_tools: string[];
}

export interface ParsedResumeData {
    basic_information: BasicInformation;
    career_overview: CareerOverview;
    sales_context: SalesContext;
    role_process_exposure: RoleProcessExposure;
    tools_platforms: ToolsPlatforms;
}

export interface ParseResumeResponse {
    status: boolean;
    message: string;
    resume_url: string;
    data: ParsedResumeData;
}

export interface UpdateCandidateDataRequest {
    job_id: string;
    basic_information: BasicInformation;
    career_overview: CareerOverview;
    sales_context: SalesContext;
    role_process_exposure: RoleProcessExposure;
    tools_platforms: ToolsPlatforms;
}

export interface UpdateCandidateDataResponse {
    status: boolean;
    message: string;
    application_id: string;
}

export interface UpdateProfessionalSummaryRequest {
    [key: string]: any;
}

export interface UpdateProfessionalSummaryResponse {
    status: boolean;
    message: string;
}

export interface RemindLaterRequest {
    application_id: string;
    remaind_at: string;
}

export interface RemindLaterResponse {
    status: boolean;
    message: string;
    application_id: string;
    data: {
        remaind_at: string;
    };
}

export interface ApplyJobRequest {
    job_id: string;
}

export interface ApplyJobResponse {
    status: boolean;
    message: string;
    application_id?: string;
}

export interface AudioInterviewRequest {
    application_id: string;
    answer?: string;
}

export interface AudioInterviewResponse {
    status: boolean;
    message: string;
    question?: string;
    done: boolean;
    stage: string;
}

export interface QAPair {
    question: string;
    answer: string;
}

export interface EvaluateAudioInterviewRequest {
    application_id: string;
    qa_pairs: QAPair[];
}

export interface EvaluateAudioInterviewResponse {
    status: boolean;
    message: string;
    qualified_for_video_round: boolean;
}

export interface VideoInterviewRequest {
    application_id?: string;
    flag?: string;
    session_id?: string;
    user_answer?: string;
}

export interface VideoInterviewResponse {
    session_id: string;
    question: string;
    step: string;
    message?: string;
}

// UPDATE AUDIO PROCTORING LOGS
export interface UpdateAudioProctoringLogsRequest {
    user_id: string;
    audio_proctoring_logs: Record<string, any>;
}

export interface UpdateAudioProctoringLogsResponse {
    status: boolean;
    message: string;
}

// Video Proctoring Logs
export interface UpdateVideoProctoringLogsRequest {
    user_id: string;
    video_url: string;
    video_proctoring_logs: Record<string, any>;
}

export interface UpdateVideoProctoringLogsResponse {
    status: boolean;
    message: string;
}

// GET CANDIDATE DASHBOARD DATA
export interface CandidateDashboardResponse {
    status: boolean;
    message: string;
    data: CandidateProfileData;
}

// Auth helpers
export function getStoredCandidateAuth(): CandidateAuthResponse | null {
    try {
        const raw = localStorage.getItem(CANDIDATE_AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setStoredCandidateAuth(payload: CandidateAuthResponse | null): void {
    if (!payload) {
        localStorage.removeItem(CANDIDATE_AUTH_STORAGE_KEY);
        // Dispatch custom event for auth state change
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('candidateAuthChanged', { detail: { authenticated: false } }));
        }
        return;
    }
    localStorage.setItem(CANDIDATE_AUTH_STORAGE_KEY, JSON.stringify(payload));
    // Dispatch custom event for auth state change
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('candidateAuthChanged', { detail: { authenticated: true } }));
    }
}

export function getCandidateAccessToken(): string {
    const auth = getStoredCandidateAuth();
    return auth?.access_token || '';
}

export function getCandidateData(): CandidateProfileData | null {
    const auth = getStoredCandidateAuth();
    return auth?.data || null;
}

function candidateAuthHeaders(extra?: Record<string, string>): Record<string, string> {
    const token = getCandidateAccessToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(extra || {})
    };
}

export function isCandidateAccessTokenValid(): boolean {
    const token = getCandidateAccessToken();
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
const candidateApi = axios.create({ baseURL: BASE_URL });

candidateApi.interceptors.request.use((config) => {
    // Check if we have a valid token before making any request
    if (!isCandidateAccessTokenValid()) {
        // Store current URL for redirect after login
        if (typeof window !== 'undefined') {
            const currentUrl = getCurrentUrlWithQuery();
            if (currentUrl && !currentUrl.includes('/candidate/login') && !currentUrl.includes('/candidate/signup')) {
                storeRedirectUrl(currentUrl);
            }
        }
        // Clear any stored auth data
        clearCandidateAuth();
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/candidate/login';
        }
        // Reject the request
        return Promise.reject(new Error('No valid authentication token found. Redirecting to login.'));
    }

    const token = getCandidateAccessToken();
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

candidateApi.interceptors.response.use(
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
                            resolve(candidateApi(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const current = getStoredCandidateAuth();
                const rt = current?.refresh_token;
                if (!rt) throw error;
                const refreshRes = await axios.post(`${BASE_URL}/refresh-access-token/`, { refresh_token: rt }, { headers: { 'Content-Type': 'application/json' } });
                const newToken = (refreshRes.data as any)?.access_token;
                if (!newToken) throw error;
                const updated = { ...(current as any), access_token: newToken, token_type: (refreshRes.data as any)?.token_type, status: true };
                setStoredCandidateAuth(updated);
                processQueue(null, newToken);
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                return candidateApi(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                // Store current URL for redirect after login
                if (typeof window !== 'undefined') {
                    const currentUrl = getCurrentUrlWithQuery();
                    if (currentUrl && !currentUrl.includes('/candidate/login') && !currentUrl.includes('/candidate/signup')) {
                        storeRedirectUrl(currentUrl);
                    }
                }
                // clear stored auth on failure
                clearCandidateAuth();
                // Redirect to login page when refresh fails
                if (typeof window !== 'undefined') {
                    window.location.href = '/candidate/login';
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
export async function candidateSignup(data: CandidateSignupRequest): Promise<CandidateAuthResponse> {
    const res = await axios.post(`${BASE_URL}/candidate-signup/`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
    const payload: CandidateAuthResponse = res.data;
    if (payload?.status && payload?.access_token) {
        setStoredCandidateAuth(payload);
    }
    return payload;
}

export async function candidateLogin(data: CandidateLoginRequest): Promise<CandidateAuthResponse> {
    const res = await axios.post(`${BASE_URL}/candidate-login/`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
    const payload: CandidateAuthResponse = res.data;
    if (payload?.status && payload?.access_token) {
        setStoredCandidateAuth(payload);
    }
    return payload;
}

export async function refreshCandidateAccessToken(request: RefreshAccessTokenRequest): Promise<RefreshAccessTokenResponse> {
    const res = await axios.post(`${BASE_URL}/refresh-access-token/`, request, {
        headers: { 'Content-Type': 'application/json' }
    });
    const payload: RefreshAccessTokenResponse = res.data;
    if (payload?.status && payload?.access_token) {
        const current = getStoredCandidateAuth() || {} as CandidateAuthResponse;
        setStoredCandidateAuth({ ...current, access_token: payload.access_token, token_type: payload.token_type, status: true, message: current?.message || '' });
    }
    return payload;
}

export async function parseCandidateResume(data: ParseResumeRequest): Promise<ParseResumeResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('file', data.file);

    const res = await candidateApi.post(`/parse-candidate-resume/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}

export async function updateCandidateData(data: UpdateCandidateDataRequest): Promise<UpdateCandidateDataResponse> {
    const res = await candidateApi.post(`/update-candidate-data/`, data);
    return res.data;
}

export async function updateProfessionalSummary(data: UpdateProfessionalSummaryRequest): Promise<UpdateProfessionalSummaryResponse> {
    const res = await candidateApi.post(`/update-professional-summary/`, data);
    return res.data;
}

export async function remindLater(data: RemindLaterRequest): Promise<RemindLaterResponse> {
    const res = await candidateApi.post(`/remind-later/`, data);
    return res.data;
}

export async function applyJob(data: ApplyJobRequest): Promise<ApplyJobResponse> {
    const res = await candidateApi.post(`/apply-job/`, data);
    return res.data;
}

export async function candidateAudioInterview(data: AudioInterviewRequest): Promise<AudioInterviewResponse> {
    const res = await candidateApi.post(`/candidate-audio-interview/`, data);
    return res.data;
}

export async function evaluateAudioInterview(data: EvaluateAudioInterviewRequest): Promise<EvaluateAudioInterviewResponse> {
    const res = await candidateApi.post(`/evaluate-audio-interview/`, data);
    return res.data;
}

export async function videoInterview(data: VideoInterviewRequest): Promise<VideoInterviewResponse> {
    const res = await candidateApi.post(`/video-interview/`, data);
    return res.data;
}

// New video interview endpoints
export async function startVideoInterview(applicationId: string): Promise<VideoInterviewResponse> {
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('flag', 'start');
    
    const res = await candidateApi.post(`/video-interview/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}

export async function continueVideoInterview(sessionId: string, userAnswer: string): Promise<VideoInterviewResponse> {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('user_answer', userAnswer);
    
    const res = await candidateApi.post(`/video-interview/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}



export async function updateVideoProctoringLogs(
    data: UpdateVideoProctoringLogsRequest
): Promise<UpdateVideoProctoringLogsResponse> {
    const res = await candidateApi.post(`/update-video-proctoring-logs/`, data);
    return res.data;
}


export async function updateAudioProctoringLogs(
    data: UpdateAudioProctoringLogsRequest
): Promise<UpdateAudioProctoringLogsResponse> {
    try {
        const res = await candidateApi.post(`/update-audio-proctoring-logs/`, data, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to update audio proctoring logs");
    }
}



export async function getCandidateDashboardData(): Promise<CandidateDashboardResponse> {
    try {
        const res = await candidateApi.get('/my-candidate-profile/');
        return res.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to fetch candidate dashboard data");
    }
}

// Utility to clear stored auth (e.g., on logout)
export function clearCandidateAuth(): void {
    setStoredCandidateAuth(null);
}
