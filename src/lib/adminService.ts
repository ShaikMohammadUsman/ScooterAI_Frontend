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
    profile_id: string;
    basic_information: {
        full_name: string;
        current_location: string;
        open_to_relocation: boolean;
        languages_spoken: string[];
        notice_period_days: number;
        current_ctc: number;
        expected_ctc: number;
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
    interview_status: {
        audio_interview_passed: boolean;
        video_interview: boolean;
        video_attended: boolean;
        audio_uploaded: boolean;
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
    total_applications?: number;
}

export interface CandidatesResponse {
    status: boolean;
    message: string;
    job_details: {
        title: string;
        description: string;
        company_id: string;
    };
    filters: {
        audio_passed: boolean | null;
        video_attended: boolean | null;
        audio_uploaded: boolean | null;
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

// Get candidates for a job
export const getJobCandidates = async (
    jobId: string,
    page: number = 1,
    pageSize: number = 20,
    audioPassed?: boolean,
    videoAttended?: boolean,
    audioUploaded?: boolean
): Promise<CandidatesResponse> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });

        if (audioPassed !== undefined) params.append('audio_passed', audioPassed.toString());
        if (videoAttended !== undefined) params.append('video_attended', videoAttended.toString());
        if (audioUploaded !== undefined) params.append('audio_uploaded', audioUploaded.toString());

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