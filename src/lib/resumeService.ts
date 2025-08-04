import axios from "axios";
// Resume API Types
export interface BasicInformation {
  full_name: string;
  current_location: string;
  open_to_relocation: boolean;
  phone_number: string;
  linkedin_url: string;
  email: string;
  specific_phone_number: string;
  notice_period: string;
  current_ctc: {
    currencyType: string;
    value: number;
    cadence?: "annual" | "monthly";
  };
  expected_ctc: {
    currencyType: string;
    value: number;
    cadence?: "annual" | "monthly";
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

export interface QuotaOwnership {
  has_quota: boolean;
  amount: number;
  cadence: string;
  attainment_history: string;
}

export interface RoleProcessExposure {
  sales_role_type: string;
  position_level: string;
  sales_stages_owned: string[];
  average_deal_size: string;
  sales_cycle_length: string;
  own_quota: boolean;
  quota_ownership: any[];
  quota_attainment: string;
}

export interface ToolsPlatforms {
  crm_tools: string[];
  sales_tools: string[];
}

// Parse Resume Request
export interface ParseResumeRequest {
  file: File;
  name: string;
  email: string;
  phone: string;
}

// Parse Resume Response
export interface ParseResumeResponse {
  status: boolean;
  user_id: string;
  message?: string;
  data: {
    basic_information: BasicInformation;
    career_overview: CareerOverview;
    sales_context: SalesContext;
    role_process_exposure: RoleProcessExposure;
    tools_platforms: ToolsPlatforms;
  };
}

// Add Resume Profile Request
export interface AddResumeProfileRequest {
  job_id: string;
  user_id: string;
  basic_information: BasicInformation;
  career_overview: CareerOverview;
  sales_context: SalesContext;
  role_process_exposure: RoleProcessExposure;
  tools_platforms: ToolsPlatforms;
}

// Add Resume Profile Response
export interface AddResumeProfileResponse {
  status: boolean;
  message: string;
  profile_id: string;
}

// Update Resume Request
export interface UpdateResumeRequest {
  user_id: string;
  file: File;
}

// Update Resume Response
export interface UpdateResumeResponse {
  status: boolean;
  message: string;
  user_id?: string;
}

// This interface represents our transformed data structure used in the UI
export interface ResumeProfile {
  basic_information: {
    full_name: string;
    current_location: string;
    open_to_relocation: boolean;
    phone_number: string;
    linkedin_url: string;
    email: string;
    specific_phone_number: string;
    notice_period: string;
    current_ctc: {
      currencyType: string;
      value: number;
      cadence?: "annual" | "monthly";
    };
    expected_ctc: {
      currencyType: string;
      value: number;
      cadence?: "annual" | "monthly";
    };
  };
  career_overview: CareerOverview;
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
}

// Chatbot API Types
export interface ChatbotRequest {
  question: string;
  job_id: string;
}

export interface ChatbotResponse {
  status: boolean;
  answer: string;
}

// Candidate Summary API Types
export interface GenerateCandidateSummaryRequest {
  user_id: string;
}

export interface GenerateCandidateSummaryResponse {
  status: boolean;
  candidate_summary: string;
}

export interface SaveCandidateSummaryRequest {
  user_id: string;
  summary_content: string;
}

export interface SaveCandidateSummaryResponse {
  status: boolean;
  message: string;
}

const API_BASE = "https://scooter-backend.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";
// const API_BASE = "https://scooter-test.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";

/**
 * Parses a resume file with user details and saves user_id to localStorage
 * @param parseData - Object containing file and user details
 * @returns Promise with parsed resume data and user_id
 */
export async function parseResume(parseData: ParseResumeRequest): Promise<ParseResumeResponse> {
  const formData = new FormData();
  formData.append("file", parseData.file);
  formData.append("name", parseData.name);
  formData.append("email", parseData.email);
  formData.append("phone", parseData.phone);
  
  try {
    const res = await axios.post(`${API_BASE}/parse-resume/`, formData, {
      headers: { 
        "accept": "application/json",
        "Content-Type": "multipart/form-data" 
      },
    });
    
    // Save user_id to localStorage
    if (res.data.status && res.data.user_id) {
      localStorage.setItem('scooterUserId', res.data.user_id);
    }
    
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to parse resume");
  }
}

/**
 * Adds a resume profile with user_id and job_id
 * @param profileData - Object containing profile data, user_id, and job_id
 * @returns Promise with profile creation response
 */
export async function addResumeProfile(profileData: AddResumeProfileRequest): Promise<AddResumeProfileResponse> {
  try {
    const res = await axios.post(`${API_BASE}/add-resume-profile/`, profileData, {
      headers: { 
        "accept": "application/json",
        "Content-Type": "application/json" 
      },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to add resume profile");
  }
}

/**
 * Gets the stored user_id from localStorage
 * @returns The stored user_id or null if not found
 */
export function getStoredUserId(): string | null {
  return localStorage.getItem('scooterUserId');
}

/**
 * Removes the stored user_id from localStorage
 */
export function removeStoredUserId(): void {
  localStorage.removeItem('scooterUserId');
}

// Legacy function for backward compatibility
export async function parseResumeLegacy(file: File): Promise<ParseResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios.post(`${API_BASE}/parse-resume/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to parse resume");
  }
}

// Legacy function for backward compatibility
export async function addResumeProfileLegacy(profile: ResumeProfile, job_id: string): Promise<AddResumeProfileResponse> {
  try {
    const res = await axios.post(`${API_BASE}/add-resume-profile/`, { ...profile, job_id }, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to add resume profile");
  }
}

/**
 * Updates a user's resume file
 * @param updateData - Object containing user_id and new resume file
 * @returns Promise with update response
 */
export async function updateResume(updateData: UpdateResumeRequest): Promise<UpdateResumeResponse> {
  const formData = new FormData();
  formData.append("user_id", updateData.user_id);
  formData.append("file", updateData.file);
  
  try {
    const res = await axios.post(`${API_BASE}/update-resume/`, formData, {
      headers: { 
        "accept": "application/json",
        "Content-Type": "multipart/form-data" 
      },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to update resume");
  }
}

/**
 * Sends a job-related question to the chatbot service
 * @param chatbotData - Object containing question and job_id
 * @returns Promise with chatbot response
 */
export async function askJobQuestion(chatbotData: ChatbotRequest): Promise<ChatbotResponse> {
  try {
    const res = await axios.post(`${API_BASE}/ask-job`, chatbotData, {
      headers: { 
        "accept": "application/json",
        "Content-Type": "application/json" 
      },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to get answer from chatbot");
  }
}

/**
 * Generates a candidate summary based on user_id
 * @param summaryData - Object containing user_id
 * @returns Promise with generated candidate summary
 */
export async function generateCandidateSummary(summaryData: GenerateCandidateSummaryRequest): Promise<GenerateCandidateSummaryResponse> {
  try {
    const res = await axios.post(`${API_BASE}/generate-resume-summary`, summaryData, {
      headers: { 
        "accept": "application/json",
        "Content-Type": "application/json" 
      },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to generate candidate summary");
  }
}

/**
 * Saves the candidate summary after user edits/confirms
 * @param saveData - Object containing user_id and summary_content
 * @returns Promise with save response
 */
export async function saveCandidateSummary(saveData: SaveCandidateSummaryRequest): Promise<SaveCandidateSummaryResponse> {
  try {
    const res = await axios.post(`${API_BASE}/save-candidate-summary`, saveData, {
      headers: { 
        "accept": "application/json",
        "Content-Type": "application/json" 
      },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to save candidate summary");
  }
} 