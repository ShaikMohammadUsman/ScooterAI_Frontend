import axios from 'axios';

const BASE_URL = 'https://scooter-backend.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io';

// Types
export interface CompanySignupData {
    company_name: string;
    email: string;
    contact_number: string;
    description: string;
    address: string;
    password: string;
}

export interface JobRoleData {
    title: string;
    description: string;
    badges: string[];
    company_id: string;
}

export interface Candidate {
    user_id?: string;
    profile_id: string;
    profile_created_at: string;
    job_fit_assessment?: string;
    basic_information: {
        full_name: string;
        current_location: string;
        open_to_relocation: boolean;
        phone_number: string;
        linkedin_url: string;
        email: string;
        specific_phone_number: string;
        notice_period: string;
        notice_period_days?: number;
        current_ctc: number | {
            currencyType: string;
            value: number;
            cadence?: string;
        };
        expected_ctc: number | {
            currencyType: string;
            value: number;
            cadence?: string;
        };
        languages_spoken?: string[];
    };
    short_summary:string;
    application_status: boolean | string;
    application_status_reason: string;
    application_status_updated_at?: string;
    final_shortlist: boolean;
    shortlisted?: boolean;
    shortlist_status_reason: string;
    call_for_interview: boolean;
    call_for_interview_notes: string;
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
    interview_status: {
        audio_interview_passed: boolean;
        video_interview_attended: boolean;
        audio_interview_attended: boolean;
        video_email_sent?: boolean;
        video_interview_url: string | null;
        audio_interview_url: string | null;
        resume_url: string | null;
        video_interview_sent?: boolean;
        audio_uploaded?: boolean;
    };
    interview_details: {
        session_id: string;
        created_at: string;
        communication_evaluation: {
            content_and_thought: {
                score: number;
                feedback: string;
            };
            verbal_delivery: {
                score: number;
                feedback: string;
            };
            non_verbal: {
                score: number;
                feedback: string;
            };
            presence_and_authenticity: {
                score: number;
                feedback: string;
            };
            overall_score: number;
            summary: string;
        };
        qa_evaluations: {
            session_id?: string;
            question_evaluations: Array<{
                question_number: number;
                step?: string;
                question: string;
                answer: string;
                skill_score: number;
                trait_score: number;
                skill_reasoning: string;
                trait_reasoning: string;
                has_signal: boolean;
                timestamp?: string;
            }>;
            overall_scores: {
                average_skill_score: number;
                average_trait_score: number;
                total_questions: number;
                questions_with_signal: number;
                questions_answered?: number;
            };
            summary: string;
            interview_completed: boolean;
            evaluation_timestamp?: string;
            role?: string;
        };
    };
    audio_interview_details: {
        audio_interview_id: string;
        created_at: string;
        qa_evaluations: Array<{
            question: string;
            answer: string;
            evaluation: {
                credibility: { score: number; feedback: string };
                ownership_depth: { score: number; feedback: string };
                communication: { score: number; feedback: string };
                confidence: { score: number; feedback: string };
                overall_score: number;
                summary: string;
            };
        }>;
        audio_interview_summary: {
            average_score: number;
            dimension_averages: {
                credibility: number;
                ownership_depth: number;
                communication: number;
                confidence: number;
            };
            total_questions: number;
            strengths: string[];
            areas_for_improvement: string[];
            audio_interview_status: boolean;
        };
    };
    video_proctoring_details?: {
        _id: string;
        user_id: string;
        email: string;
        "screen time"?: string | number;
        flags: any[];
        tab_switches: number;
        window_focus_loss: number;
        right_clicks: number;
        dev_tools_attempts: number;
        multi_touch_gestures: number;
        swipe_gestures: number;
        orientation_changes: number;
        interview_events: Array<{
            event: string;
            timestamp: string;
            details: Record<string, any>;
        }>;
        interview_duration: number;
        submission_timestamp: string;
        updated_at: string;
    };
}

export interface JobRole {
    _id: string;
    title: string;
    description: string;
    badges: string[];
    company_id: string;
    created_at: string;
    is_active: boolean;
    total_candidates: number;
    audio_attended_count: number;
    video_attended_count: number;
    moved_to_video_round_count: number;
}

export interface CandidatesResponse {
    status: boolean;
    message: string;
    job_details: {
        title: string;
        description: string;
        company_id: string;
        _id?: string;
        created_at?: string;
        is_active?: boolean;
    };
    filters: {
        audio_passed?: boolean | null;
        video_attended?: boolean | null;
        audio_uploaded?: boolean | null;
        shortlisted?: boolean | null;
        call_for_interview?: boolean | null;
        application_status?: boolean | string | null;
        video_interview_sent?: boolean | null;
    };
    pagination: {
        current_page: number;
        page_size: number;
        total_candidates: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
    candidates: Candidate[];
}

export interface JobRolesResponse {
    status: boolean;
    message: string;
    roles: JobRole[];
}

export interface CompanyLoginData {
    email: string;
    password: string;
}

export interface SearchProfileData {
    basic_information?: {
        current_location?: string;
        open_to_relocation?: boolean;
    };
    career_overview?: {
        total_years_experience?: number;
        years_sales_experience?: number;
    };
    sales_context?: {
        sales_type?: string;
        industries_sold_into?: string[];
        regions_sold_into?: string[];
    };
    role_process_exposure?: {
        sales_role_type?: string;
        position_level?: string;
    };
    tools_platforms?: {
        crm_used?: string[];
    };
}

export interface CommunicationScores {
    content_and_thought: {
        score: number;
        feedback: string;
    };
    verbal_delivery: {
        score: number;
        feedback: string;
    };
    non_verbal: {
        score: number;
        feedback: string;
    };
    presence_and_authenticity: {
        score: number;
        feedback: string;
    };
    overall_score: number;
}

export interface Profile {
    _id: string;
    basic_information: {
        full_name: string;
        current_location: string;
        open_to_relocation: boolean;
        languages_spoken?: string[];
        notice_period_days?: number;
        notice_period?: string;
        current_ctc: number | { currencyType: string; value: number };
        expected_ctc: number | { currencyType: string; value: number };
        phone_number?: string;
        linkedin_url?: string;
        email?: string;
        specific_phone_number?: string;
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
    sales_context: {
        sales_type: string[];
        sales_motion: string[];
        industries_sold_into: string[];
        regions_sold_into: string[];
        buyer_personas: string[];
    };
    role_process_exposure: {
        sales_role_type: string;
        position_level: string;
        sales_stages_owned: string[];
        average_deal_size_range: string;
        sales_cycle_length: string;
        monthly_deal_volume: number;
        quota_ownership: {
            has_quota: boolean;
            amount: number;
            cadence: string;
            attainment_history: string;
        };
    };
    tools_platforms: {
        crm_used: string[];
        sales_tools: string[];
        communication_tools: string[];
    };
    job_id: string | null;
    created_at: string;
    audio_interview: boolean;
    video_uploaded_at: string | null;
    video_url: string | null;
    match_score: number;
    communication_scores: CommunicationScores;
}

export interface SearchProfilesResponse {
    total_matches: number;
    job_id: string | null;
    profiles: Profile[];
}

export interface AuthResponse{
    status: boolean;
    message: string;
    company_id: string;
    company_name: string;
    email: string;
    contact_number: string;
    description: string;
    address: string;
}

export interface UpdateApplicationStatusRequest {
    user_id: string;
    application_status: boolean | string;
    reason: string;
}

export interface UpdateApplicationStatusResponse {
    status: boolean;
    message: string;
    user_id?: string;
    application_status?: boolean | string;
    reason?:string;
}

export interface CallForInterviewRequest {
    user_id: string;
    call_for_interview: boolean;
    notes: string;
}

export interface CallForInterviewResponse {
    message: string;
    user_id: string;
    application_status: boolean;
    reason: string;
}

export interface MarkFinalShortlistRequest {
    user_id: string;
    final_shortlist: boolean;
    reason: string;
}

export interface MarkFinalShortlistResponse {
    message: string;
    user_id: string;
    shortlist_status: boolean;
    reason: string;
}

export interface ResetVideoInterviewRequest {
    user_id: string;
    reset_reason: string;
}

export interface ResetVideoInterviewResponse {
    status: boolean;
    message: string;
    user_id?: string;
    reset_reason?: string;
}

function getToken(): string {
    const companyDetails = localStorage.getItem('company_details');
    if (companyDetails) {
        const details = JSON.parse(companyDetails);
        return details.token || '';
    }
    return '';
}

// Get candidates for a job
export const getJobCandidates = async (
    jobId: string,
    page: number = 1,
    pageSize: number = 20,
    application_status?: boolean | string,
    videoAttended?: boolean,
    shortlisted?: boolean,
    callForInterview?: boolean,
    audioAttended?: boolean,
    videoInterviewSent?: boolean,
): Promise<CandidatesResponse> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });

        // Application status can be boolean or string (for new status values)
        if (application_status !== undefined) {
            if (typeof application_status === 'boolean') {
                params.append('application_status', application_status.toString());
            } else {
                params.append('application_status', application_status);
            }
        }
        
        // Video attended filter
        if (videoAttended !== undefined) params.append('video_attended', videoAttended.toString());
        
        // Shortlisted filter (for "Send to hiring manager")
        if (shortlisted !== undefined) params.append('shortlisted', shortlisted.toString());
        
        // Call for interview filter
        if (callForInterview !== undefined) params.append('call_for_interview', callForInterview.toString());
        
        // Audio attended filter
        if (audioAttended !== undefined) params.append('audio_attended', audioAttended.toString());
        
        // Video interview sent filter
        if (videoInterviewSent !== undefined) params.append('video_interview_sent', videoInterviewSent.toString());

        console.log(params.toString());
        const response = await axios.get(`${BASE_URL}/job-candidates/${jobId}?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching job candidates:', error);
        throw error;
    }
};

// Company signup
export const companySignup = async (data: CompanySignupData): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${BASE_URL}/company-signup/`, data);
        return response.data;
    } catch (error) {
        console.error('Error in company signup:', error);
        throw error;
    }
};

// Company login
export const companyLogin = async (data: CompanyLoginData): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${BASE_URL}/company-login/`, data);
        return response.data;
    } catch (error) {
        console.error('Error in company login:', error);
        throw error;
    }
};

// Add a new job role
export const addJobRole = async (data: JobRoleData): Promise<any> => {
    try {
        const response = await axios.post(`${BASE_URL}/add-job-role/`, data);
        return response.data;
    } catch (error) {
        console.error('Error adding job role:', error);
        throw error;
    }
};

// More flexible variant that accepts any valid dictionary
export const createJobRole = async (payload: Record<string, any>): Promise<any> => {
    try {
        const response = await axios.post(`${BASE_URL}/add-job-role/`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating job role:', error);
        throw error;
    }
};

// Get list of jobs for a company
export const getCompanyJobRoles = async (companyId: string): Promise<JobRolesResponse> => {
    try {
        const response = await axios.get(`${BASE_URL}/company-job-roles/${companyId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching company job roles:', error);
        throw error;
    }
};


// Search profiles
export const searchProfiles = async (data: SearchProfileData, exact: boolean = false): Promise<SearchProfilesResponse> => {
    try {
        const response = await axios.post(`${BASE_URL}/search-profiles/?exact=${exact}`, data);
        return response.data;
    } catch (error) {
        console.error('Error searching profiles:', error);
        throw error;
    }
};

export async function updateApplicationStatus(
    request: UpdateApplicationStatusRequest
): Promise<UpdateApplicationStatusResponse> {
    try {
        const response = await fetch(`${BASE_URL}/application-status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error('Failed to update application status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
    }
}

/**
 * Updates the call for interview status for a candidate
 * @param request - Object containing user_id, call_for_interview status, and notes
 * @returns Promise with the call for interview response
 */
export async function callForInterview(
    request: CallForInterviewRequest
): Promise<CallForInterviewResponse> {
    try {
        const response = await fetch(`${BASE_URL}/call-for-interview/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error('Failed to update call for interview status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating call for interview status:', error);
        throw error;
    }
}

/**
 * Marks a candidate for final shortlist
 * @param request - Object containing user_id, final_shortlist status, and reason
 * @returns Promise with the final shortlist response
 */
export async function markFinalShortlist(
    request: MarkFinalShortlistRequest
): Promise<MarkFinalShortlistResponse> {
    try {
        const response = await fetch(`${BASE_URL}/mark-final-shortlist/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error('Failed to update final shortlist status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating final shortlist status:', error);
        throw error;
    }
}

/**
 * Resets the video interview for a candidate
 * @param request - Object containing user_id and reset_reason
 * @returns Promise with the reset video interview response
 */
export async function resetVideoInterview(
    request: ResetVideoInterviewRequest
): Promise<ResetVideoInterviewResponse> {
    try {
        const response = await fetch(`${BASE_URL}/reset-video-interview/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error('Failed to reset video interview');
        }

        return await response.json();
    } catch (error) {
        console.error('Error resetting video interview:', error);
        throw error;
    }
} 

// ---------------------------------------------------------------------------------------------
// Contacts CSV Download

export interface ContactsCsvFilters {
    audio_attended?: boolean;
    video_attended?: boolean;
    application_status?: string; // e.g. 'send video link'
    call_for_interview?: boolean;
    shortlisted?: boolean;
    video_interview_sent?: boolean;
}

// ---------------------------------------------------------------------------------------------
// Job Description Generation (local service)


export async function generateJobDescription(payload: Record<string, any>): Promise<string> {
    try {
        const res = await axios.post(`${BASE_URL}/generate-job-description/`, payload, {
            headers: { 'Content-Type': 'application/json', Accept: 'text/plain, application/json' },
            responseType: 'text',
            transformResponse: [(data) => data],
        });
        // If backend returns JSON with description, try to parse; otherwise return text
        try {
            const maybeJson = JSON.parse(res.data);
            if (maybeJson && typeof maybeJson.description === 'string') return maybeJson.description;
        } catch {
            // not JSON
        }
        return String(res.data || '');
    } catch (error: any) {
        console.error('Error generating job description:', error);
        throw new Error(error.response?.data?.message || 'Failed to generate job description');
    }
}

export async function downloadContactsCsv(
    jobId: string,
    filters: ContactsCsvFilters = {}
): Promise<Blob> {
    try {
        const params = new URLSearchParams();
        if (filters.audio_attended !== undefined) params.append('audio_attended', String(filters.audio_attended));
        if (filters.video_attended !== undefined) params.append('video_attended', String(filters.video_attended));
        if (filters.application_status !== undefined) params.append('application_status', filters.application_status);
        if (filters.call_for_interview !== undefined) params.append('call_for_interview', String(filters.call_for_interview));
        if (filters.shortlisted !== undefined) params.append('shortlisted', String(filters.shortlisted));
        if (filters.video_interview_sent !== undefined) params.append('video_interview_sent', String(filters.video_interview_sent));

        const url = `${BASE_URL}/contacts-csv/${jobId}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axios.get(url, {
            responseType: 'blob',
            headers: { Accept: 'text/csv, application/json' },
        });
        return response.data as Blob;
    } catch (error) {
        console.error('Error downloading contacts CSV:', error);
        throw error;
    }
}