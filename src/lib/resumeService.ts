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

// This interface represents the raw data from the server
export interface ParseResumeResponse {
  status: boolean;
  message?: string;
  data: {
    basic_information: BasicInformation;
    career_overview: CareerOverview;
    sales_context: SalesContext;
    role_process_exposure: RoleProcessExposure;
    tools_platforms: ToolsPlatforms;
  };
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

export interface AddResumeProfileResponse { profile_id: string; }

const API_BASE = "https://scooter-backend.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";

export async function parseResume(file: File): Promise<ParseResumeResponse> {
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

export async function addResumeProfile(profile: ResumeProfile, job_id: string): Promise<AddResumeProfileResponse> {
  try {
    const res = await axios.post(`${API_BASE}/add-resume-profile/`, { ...profile, job_id }, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to add resume profile");
  }
} 