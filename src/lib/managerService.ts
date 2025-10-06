import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { storeRedirectUrl, getCurrentUrlWithQuery } from './utils';

// Base URLs
const BASE_URL = 'https://scooter-backend-prod.thankfulwater-944fb792.centralindia.azurecontainerapps.io';

// Storage keys
const MANAGER_AUTH_STORAGE_KEY = 'manager_auth';

// Types
export interface HiringManagerLoginRequest {
    email: string;
    password: string;
}

export interface HiringManagerProfileData {
    first_name: string;
    last_name: string;
    email: string;
}

export interface HiringManagerAuthResponse {
    status: boolean;
    message: string;
    data?: HiringManagerProfileData;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    manager_id?: string; // present on signup
}

export interface HiringManagerSignupRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
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

export interface GenerateJobDescriptionRequest {
    [key: string]: any;
}

export interface GeneratedJobDescriptionResponse {
    status: boolean;
    job_description?: Record<string, any> | string;
}

export interface JobBasicInfo {
    companyName: string | null;
    jobTitle: string;
    roleType: string | null;
    primaryFocus: string[] | null;
    salesProcessStages: string[] | null;
}

export interface JobExperienceSkills {
    minExp: number;
    maxExp: number;
    skillsRequired: string[] | null;
    workLocation: string | null;
    location: string[] | null;
    timeZone: string[] | null;
}

export interface JobCompensations {
    baseSalary: {
        currency: string;
        minSalary: number;
        maxSalary: number;
        cadence: string | null;
    };
    ote: string[] | null;
    equityOffered: boolean | null;
    opportunities: string[] | null;
    keyChallenged: string[] | null;
    laguages: string[] | null;
}

export interface JobAggregate {
    basicInfo: JobBasicInfo;
    experienceSkills: JobExperienceSkills | null;
    compensations: JobCompensations | null;
    isCompleted: boolean;
    created_at: string;
    is_active?: boolean;
    created_by: string;
    job_id: string;
    total_candidates?: number;
    audio_attended_count?: number;
    video_attended_count?: number;
    moved_to_video_round_count?: number;
}

export interface MyJobRolesResponse {
    status: boolean;
    message: string;
    data: JobAggregate[];
}

export interface ManagerCandidate {
    application_id: string;
    profile_created_at: string;
    name: string;
    email: string;
    phone: string;
    professional_summary: string;
    basic_information: {
        full_name: string;
        current_location: string;
        open_to_relocation: boolean;
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
    };
    career_overview: {
        total_years_experience: number;
        years_sales_experience: number;
        average_tenure_per_role: number;
        employment_gaps: {
            has_gaps: boolean;
            duration: string;
        };
        promotion_history: boolean;
        company_history: Array<{
            company_name: string;
            position: string;
            start_date: string;
            end_date: string;
            duration_months: number;
            is_current: boolean;
        }>;
    };
    role_process_exposure: {
        sales_role_type: string;
        position_level: string;
        sales_stages_owned: string[];
        average_deal_size: string;
        sales_cycle_length: string;
        own_quota: boolean;
        quota_ownership: string[];
        quota_attainment: string;
    };
    sales_context: {
        sales_type: string;
        sales_motion: string;
        industries_sold_into: string[];
        regions_sold_into: string[];
        buyer_personas: string[];
    };
    tools_platforms: {
        crm_tools: string[];
        crm_used: string | null;
        sales_tools: string[];
    };
    resume_url: string;
    application_status: string;
    final_shortlist: boolean;
    call_for_interview: boolean;
    interview_status: {
        audio_interview_passed: boolean;
        video_interview_attended: boolean;
        audio_interview_attended: boolean;
        video_email_sent: boolean;
        video_interview_url: string | null;
        processed_video_interview_url: string | null;
        audio_interview_url: string;
        resume_url_from_user_account: string;
    };
    audio_proctoring_details: {
        _id: string;
        user_id: string;
        dev_tools_attempts: number;
        email: string;
        flags: Array<{
            message: string;
            timestamp: string;
            type: string;
            severity: string;
            details?: Record<string, any>;
        }>;
        interview_duration: number;
        interview_events: Array<{
            event: string;
            timestamp: string;
            details: Record<string, any>;
        }>;
        multi_touch_gestures: number;
        orientation_changes: number;
        right_clicks: number;
        screen_time: string;
        submission_timestamp: string;
        swipe_gestures: number;
        tab_switches: number;
        updated_at: string;
        window_focus_loss: number;
    };
    video_proctoring_details: {
        _id: string;
        user_id: string;
        dev_tools_attempts: number;
        email: string;
        flags: Array<{
            message: string;
            timestamp: string;
            type: string;
            severity: string;
            details?: Record<string, any>;
        }>;
        interview_duration: number;
        interview_events: Array<{
            event: string;
            timestamp: string;
            details: Record<string, any>;
        }>;
        multi_touch_gestures: number;
        orientation_changes: number;
        right_clicks: number;
        screen_time: string;
        submission_timestamp: string;
        swipe_gestures: number;
        tab_switches: number;
        updated_at: string;
        window_focus_loss: number;
    };
    application_status_reason?: string;
    shortlist_status_reason?: string;
    interview_details?: {
        communication_evaluation?: {
            content_and_thought?: {
                score?: number;
                feedback?: string;
            };
            verbal_delivery?: {
                score?: number;
                feedback?: string;
            };
            non_verbal?: {
                score?: number;
                feedback?: string;
            };
            presence_and_authenticity?: {
                score?: number;
                feedback?: string;
            };
            overall_score?: number;
            summary?: string;
        };
        qa_evaluations?: {
            question_evaluations?: {
                question_number?: number;
                step?: string;
                question?: string;
                answer?: string;
                skill_score?: number;
                trait_score?: number;
                skill_reasoning?: string;
                trait_reasoning?: string;
                has_signal?: boolean;
                timestamp?: string;
            }[];
            overall_scores?: {
                average_skill_score?: number;
                average_trait_score?: number;
                total_questions?: number;
                questions_with_signal?: number;
                questions_answered?: number;
            };
            summary?: string;
            interview_completed?: boolean;
            evaluation_timestamp?: string;
            role?: string;
            session_id?: string;
        };
    };

    audio_interview_details?: {
        audio_interview_id: string;
        created_at: string;
        qa_evaluations: Array<{
            question: string;
            answer: string;
            evaluation: {
                credibility_score: number;
                communication_score: number;
                sales_motion: string;
                sales_cycle: string;
                icp: string;
                highlights: string[];
                red_flags: string[];
                coaching_focus: string;
                fit_summary: string;
            };
        }>;
        audio_interview_summary: {
            average_score: number;
            credibility_score: number;
            communication_score: number;
            total_questions: number;
            strengths: string[];
            areas_for_improvement: string[];
            red_flags: string[];
            icp_summary: string[];
            sales_motion_summary: string[];
            sales_cycle_summary: string[];
            coaching_focus: string | null;
            audio_interview_status: boolean;
        };
    };
}

export interface MyJobCandidatesResponse {
    status: boolean;
    message: string;
    job_details: {
        title: string;
        moved_to_video_round_count: number;
        audio_attended_count: number;
        video_attended_count: number;
        candidate_count: number;
    };
    filters: {
        audio_attended: boolean | null;
        video_attended: boolean | null;
        application_status: string | boolean | null;
    };
    pagination: {
        current_page: number;
        page_size: number;
        total_candidates: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
    candidates: ManagerCandidate[];
}

export interface CreateJobStage1Request {
    basicInfo: {
        companyName: string;
        jobTitle: string;
        roleType: string;
        primaryFocus: string[];
        salesProcessStages: string[];
    };
    isCompleted: boolean;
}

export interface CreateJobStage2Request {
    job_id: string;
    experienceSkills: {
        minExp: number;
        maxExp: number;
        skillsRequired: string[];
        workLocation: string;
        location: string[];
        timeZone: string[];
    };
    isCompleted: boolean;
}

export interface CreateJobStage3Request {
    job_id: string;
    compensations: {
        baseSalary: {
            currency: string;
            minSalary: number;
            maxSalary: number;
            cadence: string;
        };
        ote: string[] | null;
        equityOffered: boolean | null;
        opportunities: string[] | null;
        keyChallenged: string[] | null;
        laguages: string[] | null;
    };
    isCompleted: boolean;
}

export type CreateJobAnyStageRequest = CreateJobStage1Request | CreateJobStage2Request | CreateJobStage3Request;

export interface CreateJobStageResponse {
    status: boolean;
    message: string;
    data: JobAggregate;
}

export interface ContactUsRequest {
    name: string;
    designation: string;
    companyName: string;
    companyEmail: string;
    query: string;
}

export interface ContactUsResponse {
    status: boolean;
    message: string;
}

export interface ScheduleInterviewRequest {
    applicantName: string;
    interviewerName: string;
    jobId: string;
    profileId: string;
    selectedDate: string; // YYYY-MM-DD
    selectedSlots: string[];
}

export interface ScheduleInterviewResponse {
    status: boolean;
    message: string;
    data?: {
        interviewId: string;
    };
}

export interface Interview {
    applicantName: string;
    interviewerName: string;
    jobId: string;
    profileId: string;
    selectedDate: string;
    selectedSlots: string[];
    created_by: string;
    created_at: string;
    interviewId: string;
}

export interface InterviewsListResponse {
    status: boolean;
    message: string;
    data: Interview[];
}

export interface InterviewDetailsResponse {
    status: boolean;
    message: string;
    data: Interview;
}

export interface RemindLaterRequest {
    user_id: string;
    remaind_at: string;
}

export interface RemindLaterResponse {
    message: string;
    user_id: string;
    remaind_at: string;
}

// Auth helpers
export function getStoredManagerAuth(): HiringManagerAuthResponse | null {
    try {
        const raw = localStorage.getItem(MANAGER_AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setStoredManagerAuth(payload: HiringManagerAuthResponse | null): void {
    if (!payload) {
        localStorage.removeItem(MANAGER_AUTH_STORAGE_KEY);
        // Dispatch custom event for auth state change
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('managerAuthChanged', { detail: { authenticated: false } }));
        }
        return;
    }
    localStorage.setItem(MANAGER_AUTH_STORAGE_KEY, JSON.stringify(payload));
    // Dispatch custom event for auth state change
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('managerAuthChanged', { detail: { authenticated: true } }));
    }
}

export function getAccessToken(): string {
    const auth = getStoredManagerAuth();
    return auth?.access_token || '';
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
    const token = getAccessToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(extra || {})
    };
}

export function isAccessTokenValid(): boolean {
    const token = getAccessToken();
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
const managerApi = axios.create({ baseURL: BASE_URL });

managerApi.interceptors.request.use((config) => {
    // Check if we have a valid token before making any request
    if (!isAccessTokenValid()) {
        // Store current URL for redirect after login
        if (typeof window !== 'undefined') {
            const currentUrl = getCurrentUrlWithQuery();
            if (currentUrl && !currentUrl.includes('/manager/login') && !currentUrl.includes('/manager/signup')) {
                storeRedirectUrl(currentUrl);
            }
        }
        // Clear any stored auth data
        clearManagerAuth();
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/manager/login';
        }
        // Reject the request
        return Promise.reject(new Error('No valid authentication token found. Redirecting to login.'));
    }

    const token = getAccessToken();
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

managerApi.interceptors.response.use(
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
                            resolve(managerApi(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const current = getStoredManagerAuth();
                const rt = current?.refresh_token;
                if (!rt) throw error;
                const refreshRes = await axios.post(`${BASE_URL}/refresh-access-token/`, { refresh_token: rt }, { headers: { 'Content-Type': 'application/json' } });
                const newToken = (refreshRes.data as any)?.access_token;
                if (!newToken) throw error;
                const updated = { ...(current as any), access_token: newToken, token_type: (refreshRes.data as any)?.token_type, status: true };
                setStoredManagerAuth(updated);
                processQueue(null, newToken);
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                return managerApi(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                // Store current URL for redirect after login
                if (typeof window !== 'undefined') {
                    const currentUrl = getCurrentUrlWithQuery();
                    if (currentUrl && !currentUrl.includes('/manager/login') && !currentUrl.includes('/manager/signup')) {
                        storeRedirectUrl(currentUrl);
                    }
                }
                // clear stored auth on failure
                clearManagerAuth();
                // Redirect to login page when refresh fails
                if (typeof window !== 'undefined') {
                    window.location.href = '/manager/login';
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
export async function hiringManagerLogin(data: HiringManagerLoginRequest): Promise<HiringManagerAuthResponse> {
    const res = await axios.post(`${BASE_URL}/hiring-manager-login/`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
    const payload: HiringManagerAuthResponse = res.data;
    if (payload?.status && payload?.access_token) {
        setStoredManagerAuth(payload);
    }
    return payload;
}

export async function hiringManagerSignup(data: HiringManagerSignupRequest): Promise<HiringManagerAuthResponse> {
    const res = await axios.post(`${BASE_URL}/hiring-manager-signup/`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
    const payload: HiringManagerAuthResponse = res.data;
    if (payload?.status && payload?.access_token) {
        setStoredManagerAuth(payload);
    }
    return payload;
}

export async function refreshAccessToken(request: RefreshAccessTokenRequest): Promise<RefreshAccessTokenResponse> {
    const res = await axios.post(`${BASE_URL}/refresh-access-token/`, request, {
        headers: { 'Content-Type': 'application/json' }
    });
    const payload: RefreshAccessTokenResponse = res.data;
    if (payload?.status && payload?.access_token) {
        const current = getStoredManagerAuth() || {} as HiringManagerAuthResponse;
        setStoredManagerAuth({ ...current, access_token: payload.access_token, token_type: payload.token_type, status: true, message: current?.message || '' });
    }
    return payload;
}

export async function generateJobDescription(payload: GenerateJobDescriptionRequest): Promise<GeneratedJobDescriptionResponse> {
    const res = await managerApi.post(`/generate-job-description/`, payload);
    return res.data;
}

export async function getMyJobCandidates(
    jobId: string,
    page: number = 1,
    page_size: number = 10,
    opts?: {
        audio_attended?: boolean;
        video_attended?: boolean;
        application_status?: string | boolean;
        video_interview_sent?: boolean;
        shortlisted?: boolean;
        call_for_interview?: boolean;
        seen?: boolean;
    }
): Promise<MyJobCandidatesResponse> {
    const params = new URLSearchParams({ page: String(page), page_size: String(page_size) });
    if (opts) {
        if (opts.audio_attended != null) params.set('audio_attended', String(opts.audio_attended));
        if (opts.video_attended != null) params.set('video_attended', String(opts.video_attended));
        if (opts.application_status != null) params.set('application_status', String(opts.application_status));
        if (opts.video_interview_sent != null) params.set('video_interview_sent', String(opts.video_interview_sent));
        if (opts.shortlisted != null) params.set('shortlisted', String(opts.shortlisted));
        if (opts.call_for_interview != null) params.set('call_for_interview', String(opts.call_for_interview));
        if (opts.seen != null) params.set('seen', String(opts.seen));
    }
    const url = `${BASE_URL}/my-job-candidates/${encodeURIComponent(jobId)}?${params.toString()}`;
    const res = await managerApi.get(url);
    return res.data;
}

export async function getMyJobRoles(): Promise<MyJobRolesResponse> {
    const res = await managerApi.get(`/my-job-roles/`);
    return res.data;
}

// Interview link sending interfaces
export interface SendInterviewLinkRequest {
    application_id: string;
    interview_type: 'audio' | 'video';
    candidate_name: string;
    candidate_email: string;
}

export interface SendInterviewLinkResponse {
    status: boolean;
    message: string;
    application_id?: string;
}

// Send audio interview link
export async function sendAudioInterviewLink(request: SendInterviewLinkRequest): Promise<SendInterviewLinkResponse> {
    const res = await managerApi.post('/send-audio-interview-link/', {
        application_id: request.application_id,
        candidate_name: request.candidate_name,
        candidate_email: request.candidate_email
    });
    return res.data;
}

// Send video interview link
export async function sendVideoInterviewLink(request: SendInterviewLinkRequest): Promise<SendInterviewLinkResponse> {
    const res = await managerApi.post('/send-video-interview-link/', {
        application_id: request.application_id,
        candidate_name: request.candidate_name,
        candidate_email: request.candidate_email
    });
    return res.data;
}

export async function createOrUpdateJob(stage: 1 | 2 | 3, body: CreateJobAnyStageRequest): Promise<CreateJobStageResponse> {
    const res = await managerApi.put(`/createJob/?stage=${stage}`, body);
    return res.data;
}

export async function contactUs(body: ContactUsRequest): Promise<ContactUsResponse> {
    const res = await managerApi.post(`/contact-us/`, body);
    return res.data;
}

export async function scheduleInterview(body: ScheduleInterviewRequest): Promise<ScheduleInterviewResponse> {
    const res = await managerApi.post(`/schedule-interview/`, body);
    return res.data;
}

export async function getInterviews(): Promise<InterviewsListResponse> {
    const res = await managerApi.get(`/interviews/`);
    return res.data;
}

export async function getInterviewById(interviewId: string): Promise<InterviewDetailsResponse> {
    const res = await managerApi.get(`/interviews/${encodeURIComponent(interviewId)}`);
    return res.data;
}

export async function remindMeLater(body: RemindLaterRequest): Promise<RemindLaterResponse> {
    const res = await axios.post(`${BASE_URL}/remaind-later/`, body, { headers: authHeaders() });
    return res.data;
}

// Utility to clear stored auth (e.g., on logout)
export function clearManagerAuth(): void {
    setStoredManagerAuth(null);
}


