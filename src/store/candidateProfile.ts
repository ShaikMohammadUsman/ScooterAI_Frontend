import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';

export interface WorkExperience {
    id?: string;
    company: string;
    position: string;
    duration: string;
    description: string;
    start_date?: string;
    end_date?: string;
    duration_months?: number;
    is_current?: boolean;
}

// Helper to calculate duration in months
const calculateDurationMonths = (start: string, end: string, isCurrent: boolean = false) => {
    if (!start) return 0;
    const startDate = dayjs(start);
    const endDate = isCurrent ? dayjs() : dayjs(end);
    if (!endDate.isValid()) return 0;
    return Math.max(0, endDate.diff(startDate, 'month'));
};

export interface SalesProfile {
    achievements: string[];
    target_achievements: string[];
    skills: string[];
}

export interface SalaryExpectations {
    min_salary: number;
    max_salary: number;
    currency: string;
}

export interface ContactDetails {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_profile?: string;
}

export interface CandidateProfile {
    work_experience: WorkExperience[];
    sales_profile: SalesProfile;
    salary_expectations: SalaryExpectations;
    contact_details: ContactDetails;
    professional_summary: string;
}

interface CandidateProfileStore {
    profile: CandidateProfile | null;
    isProfileComplete: boolean;
    parsingData: any | null;
    setParsingData: (data: any) => void;
    updateProfile: (updates: Partial<CandidateProfile>) => void;
    setProfile: (profile: CandidateProfile) => void;
    clearProgress: () => void;
    markerProfileComplete: () => void;
}

const defaultProfile: CandidateProfile = {
    work_experience: [],
    sales_profile: {
        achievements: [],
        target_achievements: [],
        skills: []
    },
    salary_expectations: {
        min_salary: 0,
        max_salary: 0,
        currency: 'INR'
    },
    contact_details: {
        full_name: '',
        email: '',
        phone: '',
        location: '',
        linkedin_profile: ''
    },
    professional_summary: ''
};

export const useCandidateProfileStore = create<CandidateProfileStore>()(
    persist(
        (set, get) => ({
            profile: null,
            isProfileComplete: false,
            parsingData: null,
            setParsingData: (data) => {
                set({ parsingData: data });

                // Map backend ParsedResumeData → local CandidateProfile
                // Support both old and new shapes defensively
                const basic = data.basic_information || data.basicInformation || {};
                const career = data.career_overview || data.careerOverview || {};
                const salesCtx = data.sales_context || data.salesContext || {};
                const roleExposure = data.role_process_exposure || data.roleProcessExposure || {};

                const companyHistory = (career.company_history || career.companyHistory || []).map((c: any) => {
                    const startDate = c.start_date || '';
                    const endDate = c.end_date || '';
                    const isCurrent = c.is_current || false;
                    const providedDuration = c.duration_months;
                    
                    // For current positions, always calculate duration from frontend to get up-to-date duration
                    // For past positions, use provided duration or calculate if not available
                    const calculatedDuration = isCurrent 
                        ? calculateDurationMonths(startDate, endDate, isCurrent)
                        : (providedDuration || calculateDurationMonths(startDate, endDate, isCurrent));
                    
                    return {
                        company: c.company_name || c.companyName || '',
                        position: c.position || '',
                        duration: c.duration || '',
                        description: '',
                        start_date: startDate,
                        end_date: endDate,
                        duration_months: calculatedDuration,
                        is_current: isCurrent
                    };
                });

                const parsedProfile: CandidateProfile = {
                    contact_details: {
                        full_name: basic.full_name || basic.fullName || '',
                        email: basic.email || '',
                        phone: basic.phone_number || basic.phoneNumber || '',
                        location: basic.current_location || basic.currentLocation || '',
                        linkedin_profile: basic.linkedin_url || basic.linkedinUrl || ''
                    },
                    professional_summary: data.professional_summary || data.professionalSummary || '',
                    work_experience: companyHistory,
                    sales_profile: {
                        achievements: (salesCtx.sales_motion || salesCtx.salesMotion || []) as string[],
                        target_achievements: [],
                        skills: (data.tools_platforms?.sales_tools || data.toolsPlatforms?.sales_tools || []) as string[]
                    },
                    salary_expectations: {
                        min_salary: basic.expected_ctc?.value || 0,
                        max_salary: basic.expected_ctc?.value || 0,
                        currency: basic.expected_ctc?.currencyType || 'INR'
                    }
                };

                set({ profile: parsedProfile });
            },
            updateProfile: (updates) => {
                const currentProfile = get().profile || defaultProfile;
                set({ profile: { ...currentProfile, ...updates } });
            },
            setProfile: (profile) => set({ profile }),
            clearProgress: () => set({ 
                profile: null, 
                parsingData: null, 
                isProfileComplete: false 
            }),
            markerProfileComplete: () => set({ isProfileComplete: true })
        }),
        {
            name: 'candidate-profile-store',
            partialize: (state) => ({
                profile: state.profile,
                isProfileComplete: state.isProfileComplete,
                parsingData: state.parsingData
            })
        }
    )
);
