"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { createJobRole, generateJobDescription } from "@/lib/adminService";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// Options
const LOCATION_TYPES = ["Remote", "Hybrid", "In-person"] as const;
const ROLE_TYPES = [
    "SDR",
    "BDR",
    "AE",
    "AM",
    "Sales Manager",
    "Sales Engineer",
    "Partnerships Manager",
    "Revenue Operations",
    "Other",
] as const;
const PRIMARY_FOCUS = ["New business", "Account expansion", "Both"] as const;
const SALES_TEAM_SIZE = ["Solo", "Under 5", "5–15", "15+"] as const;
const COLLABORATES_WITH = [
    "Leadership",
    "Product",
    "Marketing",
    "CS",
    "Engineering",
    "Legal",
    "Revenue Operations",
    "Enablement",
    "Support",
] as const;
const EQUITY_OFFERED = ["Yes", "No"] as const;
const PROCESS_STAGES = ["Prospecting", "Qualification", "Closing", "Account Management"] as const;
const SALES_CYCLE = ["7–30 days", "30–60 days", "60–90 days", "90+ days"] as const;
const KPIS = ["Meetings set", "Opportunities created", "Revenue attainment", "Pipeline value"] as const;
const QUOTA_CYCLE = ["Monthly", "Quarterly", "Annual"] as const;
const INDUSTRIES = ["SaaS", "Fintech", "E-commerce", "Healthcare", "Other"] as const;
const COMPANY_SIZE_SOLD_TO = ["Startup", "SMB", "Mid-market", "Enterprise"] as const;
const BUYER_TITLES = ["Founder", "CXO", "VPs", "PMs", "Other"] as const;
const DEAL_SIZE = ["$1–5K", "$5–25K", "$25–100K", "$100K+"] as const;
const TERRITORY = ["India", "APAC", "EU", "US", "Global"] as const;
const TOOLS_USED = ["HubSpot", "Salesforce", "Slack", "Apollo", "Outreach", "Other"] as const;
const CULTURE_KEYWORDS = ["Builder-led", "Structured", "High-trust", "Fast-paced", "Hands-on"] as const;
const PROMOTION_PATH = ["Yes", "Flexible", "Not defined"] as const;
const TRAITS_VALUED = ["Curiosity", "Grit", "Empathy", "Coachability", "Autonomy"] as const;
const TONE_PREFERENCE = ["Witty", "Formal", "Gen Z", "Startup-neutral"] as const;
const POSTING_PLATFORM = ["LinkedIn", "Company website", "Bravado", "Other"] as const;
const EXPERIENCE_REQUIRED = ["0–1", "1–3", "3–5", "5–8", "8+"] as const;
const TOTAL_EXPERIENCE = ["0–1", "1–3", "3–5", "5–8", "8+"] as const;
const REMOTE_OVERLAP = ["India hours", "US overlap", "Flexible", "Not important"] as const;

// Fields that are filterable (show toggles), based on the spec
const FILTERABLE_FIELDS = new Set<keyof JobDescriptionForm>([
    "job_title",
    "location_type",
    "city",
    "role_type",
    "primary_focus",
    "sales_team_size",
    "collaborates_with",
    "base_salary",
    "ote",
    "equity_offered",
    "process_stages",
    "sales_cycle",
    "kpis",
    "quota_cycle",
    "industries",
    "company_size_sold_to",
    "buyer_titles",
    "deal_size",
    "territory",
    "tools_used",
    "sales_culture",
    "culture_keywords",
    "promotion_path",
    "traits_valued",
    "experience_required",
    "total_experience",
    "remote_overlap_timezone",
]);

// Form value types
type YesNo = "Yes" | "No";

type JobDescriptionForm = {
    company_name: string;
    job_title: string;
    source?: string; // Where they heard about us
    location_type: typeof LOCATION_TYPES[number];
    city?: string;
    role_type: typeof ROLE_TYPES[number];
    primary_focus: typeof PRIMARY_FOCUS[number];
    reports_to?: string;
    sales_team_size: typeof SALES_TEAM_SIZE[number];
    collaborates_with: string[];
    base_salary?: number | undefined;
    ote?: number | undefined;
    commission_structure?: string;
    equity_offered: typeof EQUITY_OFFERED[number];
    process_stages: string[];
    sales_cycle: typeof SALES_CYCLE[number];
    kpis: string[];
    quota_cycle: typeof QUOTA_CYCLE[number];
    industries: string[];
    company_size_sold_to: typeof COMPANY_SIZE_SOLD_TO[number];
    buyer_titles: string[];
    deal_size: typeof DEAL_SIZE[number];
    territory: string[];
    tools_used: string[];
    role_excites?: string;
    role_challenges?: string;
    sales_culture?: string;
    culture_keywords: string[];
    promotion_path: typeof PROMOTION_PATH[number];
    traits_valued: string[];
    tone_preference?: typeof TONE_PREFERENCE[number];
    posting_platform?: typeof POSTING_PLATFORM[number];
    save_to_db?: YesNo;
    experience_required: typeof EXPERIENCE_REQUIRED[number];
    total_experience: typeof TOTAL_EXPERIENCE[number];
    remote_overlap_timezone: typeof REMOTE_OVERLAP[number];
    must_have_skills?: string;
    // Toggles map: {field}_filterable and {field}_must
    [key: `${string}_filterable`]: boolean | any;
    [key: `${string}_must`]: boolean | any;
};

function FieldToggles({
    name,
    control,
    className,
}: {
    name: keyof JobDescriptionForm;
    control: any;
    className?: string;
}) {
    if (!FILTERABLE_FIELDS.has(name)) return null;
    const filterableKey = `${String(name)}_filterable` as const;
    const mustKey = `${String(name)}_must` as const;
    return (
        <div className={cn("flex items-center gap-4", className)}>
            <FormField
                control={control}
                name={filterableKey as any}
                render={({ field }) => (
                    <div className="flex items-center gap-2">
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                        <span className="text-xs text-gray-600">Include in filters</span>
                    </div>
                )}
            />
            <FormField
                control={control}
                name={mustKey as any}
                render={({ field }) => (
                    <div className="flex items-center gap-2">
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                        <span className="text-xs text-gray-600">Must-have</span>
                    </div>
                )}
            />
        </div>
    );
}

export default function Page() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Partial<JobDescriptionForm>>({});
    const [generatedDescription, setGeneratedDescription] = useState<string>("");
    const [generatedBadges, setGeneratedBadges] = useState<string[]>([]);
    const [jobRolePayloadState, setJobRolePayloadState] = useState<any | null>(null);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isCreatingJob, setIsCreatingJob] = useState(false);

    const form = useForm<JobDescriptionForm>({
        defaultValues: {
            company_name: "",
            job_title: "",
            source: "",
            location_type: "Remote",
            city: "",
            role_type: "SDR",
            primary_focus: "New business",
            reports_to: "",
            sales_team_size: "Under 5",
            collaborates_with: [],
            base_salary: undefined,
            ote: undefined,
            commission_structure: "",
            equity_offered: "No",
            process_stages: [],
            sales_cycle: "30–60 days",
            kpis: [],
            quota_cycle: "Quarterly",
            industries: [],
            company_size_sold_to: "SMB",
            buyer_titles: [],
            deal_size: "$5–25K",
            territory: [],
            tools_used: [],
            role_excites: "",
            role_challenges: "",
            sales_culture: "",
            culture_keywords: [],
            promotion_path: "Flexible",
            traits_valued: [],
            tone_preference: "Startup-neutral",
            posting_platform: "LinkedIn",
            save_to_db: "Yes",
            experience_required: "1–3",
            total_experience: "3–5",
            remote_overlap_timezone: "India hours",
            must_have_skills: "",
        },
        mode: "onBlur",
    });

    const { control, handleSubmit, watch, formState: { errors, isValid }, setValue, getValues } = form;
    const locationType = watch("location_type");

    // Define form steps
    const formSteps = [
        {
            id: 'welcome',
            title: 'Welcome',
            description: 'Hi! Excited to get you closer to your superstar sales hire quickly.',
            type: 'welcome'
        },
        {
            id: 'source',
            title: 'Source',
            description: 'But first, where did you hear about us?',
            type: 'multiple-choice',
            options: [
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'website', label: 'Website' },
                { value: 'saasboomi', label: 'SaaSBoomi' },
                { value: 'revgenius', label: 'RevGenius' },
                { value: 'referral', label: 'Referral' },
                { value: 'outreach', label: 'We reached out' },
                { value: 'other', label: 'Other' }
            ]
        },
        {
            id: 'basics',
            title: 'Company & Role Basics',
            description: 'We start with the basic elements that help candidates mentally picture themselves in your specific environment and determine if this aligns with their career goals.',
            type: 'form-fields',
            fields: ['company_name', 'job_title', 'reports_to']
        },
        {
            id: 'location',
            title: 'Location',
            description: 'Is this role in-person, remote or hybrid?',
            type: 'location-selection'
        },
        {
            id: 'role-type',
            title: 'Role Type',
            description: 'Select one role type that best describes this position.',
            type: 'role-selection'
        },
        {
            id: 'primary-focus',
            title: 'Primary Focus',
            description: 'What is the primary focus of this role?',
            type: 'single-choice',
            options: PRIMARY_FOCUS.map(focus => ({ value: focus, label: focus }))
        },
        {
            id: 'team-size',
            title: 'Sales Team Size',
            description: 'How large is your current sales team?',
            type: 'single-choice',
            options: SALES_TEAM_SIZE.map(size => ({ value: size, label: size }))
        },
        {
            id: 'compensation',
            title: 'Compensation',
            description: 'Let\'s talk about the compensation structure for this role.',
            type: 'compensation-fields'
        },
        {
            id: 'sales-process',
            title: 'Sales Process',
            description: 'Tell us about your sales process and what this role will be responsible for.',
            type: 'sales-process-fields'
        },
        {
            id: 'market',
            title: 'Market & Customers',
            description: 'Help candidates understand your target market and customer base.',
            type: 'market-fields'
        },
        {
            id: 'deal-territory',
            title: 'Deal Size & Territory',
            description: 'What deal sizes and territories will this role cover?',
            type: 'deal-territory-fields'
        },
        {
            id: 'tools',
            title: 'Tools & Technology',
            description: 'What tools and technologies will this role use?',
            type: 'tools-fields'
        },
        {
            id: 'culture',
            title: 'Company Culture',
            description: 'What makes your company culture unique and what traits do you value?',
            type: 'culture-fields'
        },
        {
            id: 'experience',
            title: 'Experience Requirements',
            description: 'What experience level are you looking for in this role?',
            type: 'experience-fields'
        },
        {
            id: 'publishing',
            title: 'Publishing Preferences',
            description: 'How would you like this job description to be presented?',
            type: 'publishing-fields'
        },
        {
            id: 'review',
            title: 'Review & Submit',
            description: 'Review all the information before creating your job description.',
            type: 'review'
        }
    ];

    const totalSteps = formSteps.length;

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const onSubmit = async (values: JobDescriptionForm) => {
        // Get company details from localStorage
        const companyDetails = localStorage.getItem('company_details');
        if (!companyDetails) {
            toast({
                title: "Company not found",
                description: "Please log in to your company account first.",
                variant: "destructive"
            });
            return;
        }

        const companyData = JSON.parse(companyDetails);
        const company_id = companyData.company_id;

        if (!company_id) {
            toast({
                title: "Company ID not found",
                description: "Please log in to your company account first.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsGeneratingDescription(true);
            // First, generate the job description using the AI endpoint
            const jobDescriptionPayload = {
                company_name: values.company_name,
                job_title: values.job_title,
                source: values.source || null,
                location_type: values.location_type,
                city: values.city || null,
                role_type: values.role_type,
                primary_focus: values.primary_focus,
                reports_to: values.reports_to || null,
                sales_team_size: values.sales_team_size,
                collaborates_with: values.collaborates_with,
                base_salary: values.base_salary || null,
                ote: values.ote || null,
                commission_structure: values.commission_structure || null,
                equity_offered: values.equity_offered,
                process_stages: values.process_stages,
                sales_cycle: values.sales_cycle,
                kpis: values.kpis,
                quota_cycle: values.quota_cycle,
                industries: values.industries,
                company_size_sold_to: values.company_size_sold_to,
                buyer_titles: values.buyer_titles,
                deal_size: values.deal_size,
                territory: values.territory,
                tools_used: values.tools_used,
                role_excites: values.role_excites || null,
                role_challenges: values.role_challenges || null,
                sales_culture: values.sales_culture || null,
                culture_keywords: values.culture_keywords,
                promotion_path: values.promotion_path,
                traits_valued: values.traits_valued,
                tone_preference: values.tone_preference || null,
                posting_platform: values.posting_platform || null,
                save_to_db: values.save_to_db,
                experience_required: values.experience_required,
                total_experience: values.total_experience,
                remote_overlap_timezone: values.remote_overlap_timezone,
                must_have_skills: values.must_have_skills || null
            };

            // Generate job description
            const jobDescriptionResponse = await generateJobDescription(jobDescriptionPayload);
            const description = jobDescriptionResponse || "";

            // Create badges array
            const badges = [
                values.job_title,
                `${values.experience_required} years sales experience`,
                ...(values.industries || []),
                values.company_size_sold_to,
                values.role_type,
                values.location_type,
                values.remote_overlap_timezone
            ].filter(Boolean);

            // Structure the complete payload
            const jobRolePayload = {
                title: values.job_title,
                description: description,
                badges: badges,
                company_id: company_id,
                job_details: {
                    // Basic job information
                    company_name: {
                        data: values.company_name,
                        filterable: false,
                        must_have: false
                    },
                    job_title: {
                        data: values.job_title,
                        filterable: values.job_title_filterable || false,
                        must_have: values.job_title_must || false
                    },
                    source: {
                        data: values.source || null,
                        filterable: false,
                        must_have: false
                    },
                    company_id: company_id,

                    // Location and work arrangement
                    location_type: {
                        data: values.location_type,
                        filterable: values.location_type_filterable || false,
                        must_have: values.location_type_must || false
                    },
                    city: {
                        data: values.city || null,
                        filterable: values.city_filterable || false,
                        must_have: values.city_must || false
                    },
                    remote_overlap_timezone: {
                        data: values.remote_overlap_timezone,
                        filterable: values.remote_overlap_timezone_filterable || false,
                        must_have: values.remote_overlap_timezone_must || false
                    },

                    // Role details
                    role_type: {
                        data: values.role_type,
                        filterable: values.role_type_filterable || false,
                        must_have: values.role_type_must || false
                    },
                    primary_focus: {
                        data: values.primary_focus,
                        filterable: values.primary_focus_filterable || false,
                        must_have: values.primary_focus_must || false
                    },
                    reports_to: {
                        data: values.reports_to || null,
                        filterable: values.reports_to_filterable || false,
                        must_have: values.reports_to_must || false
                    },
                    sales_team_size: {
                        data: values.sales_team_size,
                        filterable: values.sales_team_size_filterable || false,
                        must_have: values.sales_team_size_must || false
                    },
                    collaborates_with: {
                        data: values.collaborates_with,
                        filterable: values.collaborates_with_filterable || false,
                        must_have: values.collaborates_with_must || false
                    },

                    // Compensation
                    base_salary: {
                        data: values.base_salary || null,
                        filterable: values.base_salary_filterable || false,
                        must_have: values.base_salary_must || false
                    },
                    ote: {
                        data: values.ote || null,
                        filterable: values.ote_filterable || false,
                        must_have: values.ote_must || false
                    },
                    commission_structure: {
                        data: values.commission_structure || null,
                        filterable: values.commission_structure_filterable || false,
                        must_have: values.commission_structure_must || false
                    },
                    equity_offered: {
                        data: values.equity_offered,
                        filterable: values.equity_offered_filterable || false,
                        must_have: values.equity_offered_must || false
                    },

                    // Sales process
                    process_stages: {
                        data: values.process_stages,
                        filterable: values.process_stages_filterable || false,
                        must_have: values.process_stages_must || false
                    },
                    sales_cycle: {
                        data: values.sales_cycle,
                        filterable: values.sales_cycle_filterable || false,
                        must_have: values.sales_cycle_must || false
                    },
                    kpis: {
                        data: values.kpis,
                        filterable: values.kpis_filterable || false,
                        must_have: values.kpis_must || false
                    },
                    quota_cycle: {
                        data: values.quota_cycle,
                        filterable: values.quota_cycle_filterable || false,
                        must_have: values.quota_cycle_must || false
                    },

                    // Market and customers
                    industries: {
                        data: values.industries,
                        filterable: values.industries_filterable || false,
                        must_have: values.industries_must || false
                    },
                    company_size_sold_to: {
                        data: values.company_size_sold_to,
                        filterable: values.company_size_sold_to_filterable || false,
                        must_have: values.company_size_sold_to_must || false
                    },
                    buyer_titles: {
                        data: values.buyer_titles,
                        filterable: values.buyer_titles_filterable || false,
                        must_have: values.buyer_titles_must || false
                    },
                    deal_size: {
                        data: values.deal_size,
                        filterable: values.deal_size_filterable || false,
                        must_have: values.deal_size_must || false
                    },
                    territory: {
                        data: values.territory,
                        filterable: values.territory_filterable || false,
                        must_have: values.territory_must || false
                    },

                    // Tools and technology
                    tools_used: {
                        data: values.tools_used,
                        filterable: values.tools_used_filterable || false,
                        must_have: values.tools_used_must || false
                    },
                    must_have_skills: {
                        data: values.must_have_skills || null,
                        filterable: values.must_have_skills_filterable || false,
                        must_have: values.must_have_skills_must || false
                    },

                    // Role description
                    role_excites: {
                        data: values.role_excites || null,
                        filterable: values.role_excites_filterable || false,
                        must_have: values.role_excites_must || false
                    },
                    role_challenges: {
                        data: values.role_challenges || null,
                        filterable: values.role_challenges_filterable || false,
                        must_have: values.role_challenges_must || false
                    },

                    // Company culture
                    sales_culture: {
                        data: values.sales_culture || null,
                        filterable: values.sales_culture_filterable || false,
                        must_have: values.sales_culture_must || false
                    },
                    culture_keywords: {
                        data: values.culture_keywords,
                        filterable: values.culture_keywords_filterable || false,
                        must_have: values.culture_keywords_must || false
                    },
                    promotion_path: {
                        data: values.promotion_path,
                        filterable: values.promotion_path_filterable || false,
                        must_have: values.promotion_path_must || false
                    },
                    traits_valued: {
                        data: values.traits_valued,
                        filterable: values.traits_valued_filterable || false,
                        must_have: values.traits_valued_must || false
                    },

                    // Experience requirements
                    experience_required: {
                        data: values.experience_required,
                        filterable: values.experience_required_filterable || false,
                        must_have: values.experience_required_must || false
                    },
                    total_experience: {
                        data: values.total_experience,
                        filterable: values.total_experience_filterable || false,
                        must_have: values.total_experience_must || false
                    },

                    // Publishing preferences
                    tone_preference: {
                        data: values.tone_preference || null,
                        filterable: values.tone_preference_filterable || false,
                        must_have: values.tone_preference_must || false
                    },
                    posting_platform: {
                        data: values.posting_platform || null,
                        filterable: values.posting_platform_filterable || false,
                        must_have: values.posting_platform_must || false
                    },
                    save_to_db: {
                        data: values.save_to_db,
                        filterable: values.save_to_db_filterable || false,
                        must_have: values.save_to_db_must || false
                    },

                    // Metadata
                    created_at: new Date().toISOString(),
                    is_active: true,
                    total_candidates: 0,
                    audio_attended_count: 0,
                    video_attended_count: 0,
                    moved_to_video_round_count: 0
                }
            };

            // Save generated artifacts for preview and later submission
            setGeneratedDescription(description);
            setGeneratedBadges(badges as string[]);
            setJobRolePayloadState(jobRolePayload);

            toast({
                title: "Job description generated",
                description: "Review the preview below and click Create Job when ready."
            });

        } catch (e: any) {
            console.error('Error creating job role:', e);
            console.error('Form values that caused the error:', values);
            toast({
                title: "Failed to create job role",
                description: e.message || "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleCreateJob = async () => {
        if (!jobRolePayloadState) {
            toast({
                title: "Nothing to submit",
                description: "Please generate the job description first.",
                variant: "destructive"
            });
            return;
        }
        try {
            setIsCreatingJob(true);
            const result = await createJobRole(jobRolePayloadState);
            console.log('Job role created successfully:', result);
            toast({
                title: "Job role created successfully!",
                description: "Your job has been saved to the database."
            });
        } catch (e: any) {
            console.error('Error creating job role:', e);
            toast({
                title: "Failed to create job",
                description: e.message || "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsCreatingJob(false);
        }
    };

    // Render individual steps
    const renderStep = (step: typeof formSteps[0]) => {
        switch (step.type) {
            case 'welcome':
                return (
                    <div className="text-center space-y-6">
                        <div className="text-4xl font-bold text-gray-900 mb-4">
                            {step.description}
                        </div>
                        <p className="text-lg text-gray-600">
                            Let's create a compelling job description that will attract the perfect sales talent for your team.
                        </p>
                    </div>
                );

            case 'multiple-choice':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {step.options?.map((option, index) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, source: option.value }));
                                        nextStep();
                                    }}
                                    className="flex items-center gap-3 p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="font-medium text-gray-900">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'form-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            {step.fields?.includes('company_name') && (
                                <FormField
                                    control={control}
                                    name="company_name"
                                    rules={{ required: "Company name is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium text-gray-900">Company Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Type your answer here..."
                                                    className="border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none px-4 py-2 text-lg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {step.fields?.includes('job_title') && (
                                <>
                                    <FormField
                                        control={control}
                                        name="job_title"
                                        rules={{ required: "Job title is required" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-medium text-gray-900">Job Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Type your answer here..."
                                                        className="border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none px-4 py-2 text-lg"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FieldToggles name="job_title" control={control} className="mt-2" />
                                </>
                            )}
                            {step.fields?.includes('reports_to') && (
                                <>
                                    <FormField
                                        control={control}
                                        name="reports_to"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-medium text-gray-900">Reports To</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., VP Sales, Head of Sales"
                                                        className="border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none px-4 py-2 text-lg"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FieldToggles name="reports_to" control={control} className="mt-2" />
                                </>
                            )}
                        </div>
                    </div>
                );

            case 'location-selection':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-md mx-auto space-y-4">
                            {LOCATION_TYPES.map((location, index) => (
                                <button
                                    key={location}
                                    type="button"
                                    onClick={() => {
                                        setValue('location_type', location);
                                    }}
                                    className={`flex items-center gap-3 w-full p-4 text-left rounded-lg border transition-colors ${watch('location_type') === location ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'}`}
                                >
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="font-medium text-gray-900">{location}</span>
                                </button>
                            ))}
                        </div>
                        <div className="max-w-md mx-auto mt-4">
                            <FieldToggles name="location_type" control={control} />
                        </div>
                        <div className="max-w-md mx-auto mt-6">
                            <FormLabel className="text-lg font-medium text-gray-900">Expected timezone overlap</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {REMOTE_OVERLAP.map((tz, index) => (
                                    <button
                                        key={tz}
                                        type="button"
                                        onClick={() => setValue('remote_overlap_timezone', tz)}
                                        className={`flex items-center gap-3 w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors ${watch('remote_overlap_timezone') === tz
                                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                            }`}
                                    >
                                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="font-medium text-gray-900">{tz}</span>
                                    </button>
                                ))}
                            </div>
                            <FieldToggles name="remote_overlap_timezone" control={control} className="mt-2" />
                        </div>
                        {watch('location_type') === 'In-person' && (
                            <div className="max-w-md mx-auto mt-6">
                                <FormField
                                    control={control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium text-gray-900">
                                                If in-person, where will this employee be located?
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Type your answer here..."
                                                    className="border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none px-4 py-2 text-lg"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FieldToggles name="city" control={control} className="mt-2" />
                            </div>
                        )}
                    </div>
                );

            case 'role-selection':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ROLE_TYPES.map((role, index) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => {
                                            setValue('role_type', role);
                                            nextStep();
                                        }}
                                        className="flex items-center gap-3 w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="font-medium text-gray-900">{role}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4">
                                <FieldToggles name="role_type" control={control} />
                            </div>
                        </div>
                    </div>
                );

            case 'single-choice':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-md mx-auto space-y-4">
                            {step.options?.map((option, index) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        // Set the appropriate field value based on step
                                        if (step.id === 'primary-focus') setValue('primary_focus', option.value as any);
                                        if (step.id === 'team-size') setValue('sales_team_size', option.value as any);
                                        nextStep();
                                    }}
                                    className="flex items-center gap-3 w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="font-medium text-gray-900">{option.label}</span>
                                </button>
                            ))}
                        </div>
                        {step.id === 'primary-focus' && (
                            <div className="max-w-md mx-auto mt-4">
                                <FieldToggles name="primary_focus" control={control} />
                            </div>
                        )}
                        {step.id === 'team-size' && (
                            <div className="max-w-md mx-auto mt-4">
                                <FieldToggles name="sales_team_size" control={control} />
                            </div>
                        )}
                    </div>
                );

            case 'compensation-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={control}
                                    name="base_salary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium text-gray-900">Base Salary (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 500000"
                                                    className="border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none px-4 py-2 text-lg"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.onChange(val === '' ? undefined : Number(val));
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-1">
                                    <FieldToggles name="base_salary" control={control} className="mt-2" />
                                </div>
                                <FormField
                                    control={control}
                                    name="ote"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium text-gray-900">OTE (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 800000"
                                                    className="border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none px-4 py-2 text-lg"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.onChange(val === '' ? undefined : Number(val));
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-1">
                                    <FieldToggles name="ote" control={control} className="mt-2" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Is equity offered?</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {EQUITY_OFFERED.map((option, index) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setValue('equity_offered', option)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('equity_offered') === option
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="equity_offered" control={control} className="mt-2" />
                            </div>
                        </div>
                    </div>
                );

            case 'sales-process-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Sales Process Stages</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PROCESS_STAGES.map((stage, index) => (
                                        <button
                                            key={stage}
                                            type="button"
                                            onClick={() => {
                                                const current = watch('process_stages') || [];
                                                const next = current.includes(stage)
                                                    ? current.filter((s: string) => s !== stage)
                                                    : [...current, stage];
                                                setValue('process_stages', next);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-left rounded-lg border transition-colors ${(watch('process_stages') || []).includes(stage)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{stage}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="process_stages" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Typical Sales Cycle</FormLabel>
                                <p className="text-sm text-gray-600 mb-4">Sales cycle length correlates strongly with a person's work style compatibility.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {SALES_CYCLE.map((cycle, index) => (
                                        <button
                                            key={cycle}
                                            type="button"
                                            onClick={() => setValue('sales_cycle', cycle)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('sales_cycle') === cycle
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{cycle}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="sales_cycle" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Quota Cycle</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {QUOTA_CYCLE.map((cycle, index) => (
                                        <button
                                            key={cycle}
                                            type="button"
                                            onClick={() => setValue('quota_cycle', cycle)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('quota_cycle') === cycle
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{cycle}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="quota_cycle" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Collaborates With</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {COLLABORATES_WITH.map((team, index) => (
                                        <button
                                            key={team}
                                            type="button"
                                            onClick={() => {
                                                const current = watch('collaborates_with') || [];
                                                const next = current.includes(team)
                                                    ? current.filter((t: string) => t !== team)
                                                    : [...current, team];
                                                setValue('collaborates_with', next);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-left rounded-lg border transition-colors ${(watch('collaborates_with') || []).includes(team)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{team}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="collaborates_with" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">KPIs</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {KPIS.map((kpi, index) => (
                                        <button
                                            key={kpi}
                                            type="button"
                                            onClick={() => {
                                                const current = watch('kpis') || [];
                                                const next = current.includes(kpi)
                                                    ? current.filter((k: string) => k !== kpi)
                                                    : [...current, kpi];
                                                setValue('kpis', next);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-left rounded-lg border transition-colors ${(watch('kpis') || []).includes(kpi)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{kpi}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="kpis" control={control} className="mt-2" />
                            </div>
                        </div>
                    </div>
                );

            case 'market-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Target Industries</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {INDUSTRIES.map((industry, index) => (
                                        <button
                                            key={industry}
                                            type="button"
                                            onClick={() => {
                                                const currentIndustries = watch('industries') || [];
                                                const newIndustries = currentIndustries.includes(industry)
                                                    ? currentIndustries.filter(i => i !== industry)
                                                    : [...currentIndustries, industry];
                                                setValue('industries', newIndustries);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${(watch('industries') || []).includes(industry)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{industry}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="industries" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Company Size Sold To</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {COMPANY_SIZE_SOLD_TO.map((size, index) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setValue('company_size_sold_to', size)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('company_size_sold_to') === size
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{size}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="company_size_sold_to" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Buyer Titles</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {BUYER_TITLES.map((title, index) => (
                                        <button
                                            key={title}
                                            type="button"
                                            onClick={() => {
                                                const current = watch('buyer_titles') || [];
                                                const next = current.includes(title)
                                                    ? current.filter((t: string) => t !== title)
                                                    : [...current, title];
                                                setValue('buyer_titles', next);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-left rounded-lg border transition-colors ${(watch('buyer_titles') || []).includes(title)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{title}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="buyer_titles" control={control} className="mt-2" />
                            </div>
                        </div>
                    </div>
                );

            case 'culture-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Sales Culture Summary</FormLabel>
                                <Textarea
                                    placeholder="Briefly describe your sales culture..."
                                    className="border-gray-300 focus:border-blue-500 rounded-lg px-4 py-3 text-base"
                                    {...form.register('sales_culture')}
                                />
                                <FieldToggles name="sales_culture" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Company Culture Keywords</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {CULTURE_KEYWORDS.map((keyword, index) => (
                                        <button
                                            key={keyword}
                                            type="button"
                                            onClick={() => {
                                                const currentKeywords = watch('culture_keywords') || [];
                                                const newKeywords = currentKeywords.includes(keyword)
                                                    ? currentKeywords.filter(k => k !== keyword)
                                                    : [...currentKeywords, keyword];
                                                setValue('culture_keywords', newKeywords);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${(watch('culture_keywords') || []).includes(keyword)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{keyword}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="culture_keywords" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Traits You Value</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TRAITS_VALUED.map((trait, index) => (
                                        <button
                                            key={trait}
                                            type="button"
                                            onClick={() => {
                                                const currentTraits = watch('traits_valued') || [];
                                                const newTraits = currentTraits.includes(trait)
                                                    ? currentTraits.filter(t => t !== trait)
                                                    : [...currentTraits, trait];
                                                setValue('traits_valued', newTraits);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${(watch('traits_valued') || []).includes(trait)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{trait}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="traits_valued" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Promotion Path</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {PROMOTION_PATH.map((path, index) => (
                                        <button
                                            key={path}
                                            type="button"
                                            onClick={() => setValue('promotion_path', path)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('promotion_path') === path
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{path}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="promotion_path" control={control} className="mt-2" />
                            </div>
                        </div>
                    </div>
                );

            case 'experience-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <FormLabel className="text-lg font-medium text-gray-900">Sales Experience</FormLabel>
                                    <div className="space-y-3">
                                        {EXPERIENCE_REQUIRED.map((exp, index) => (
                                            <button
                                                key={exp}
                                                type="button"
                                                onClick={() => setValue('experience_required', exp)}
                                                className={`flex items-center gap-3 w-full p-3 text-left rounded-lg border transition-colors ${watch('experience_required') === exp
                                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="font-medium">{exp} years</span>
                                            </button>
                                        ))}
                                    </div>
                                    <FieldToggles name="experience_required" control={control} className="mt-2" />
                                </div>
                                <div className="space-y-4">
                                    <FormLabel className="text-lg font-medium text-gray-900">Total Experience</FormLabel>
                                    <div className="space-y-3">
                                        {TOTAL_EXPERIENCE.map((exp, index) => (
                                            <button
                                                key={exp}
                                                type="button"
                                                onClick={() => setValue('total_experience', exp)}
                                                className={`flex items-center gap-3 w-full p-3 text-left rounded-lg border transition-colors ${watch('total_experience') === exp
                                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="font-medium">{exp} years</span>
                                            </button>
                                        ))}
                                    </div>
                                    <FieldToggles name="total_experience" control={control} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'publishing-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Tone Preference</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TONE_PREFERENCE.map((tone, index) => (
                                        <button
                                            key={tone}
                                            type="button"
                                            onClick={() => setValue('tone_preference', tone)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('tone_preference') === tone
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{tone}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Posting Platform</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {POSTING_PLATFORM.map((platform, index) => (
                                        <button
                                            key={platform}
                                            type="button"
                                            onClick={() => setValue('posting_platform', platform)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('posting_platform') === platform
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{platform}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Save to Database</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {["Yes", "No"].map((option, index) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setValue('save_to_db', option as any)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('save_to_db') === option
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'deal-territory-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Deal Size</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {DEAL_SIZE.map((size, index) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setValue('deal_size', size)}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${watch('deal_size') === size
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{size}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="deal_size" control={control} className="mt-2" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Territory Coverage</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TERRITORY.map((territory, index) => (
                                        <button
                                            key={territory}
                                            type="button"
                                            onClick={() => {
                                                const currentTerritories = watch('territory') || [];
                                                const newTerritories = currentTerritories.includes(territory)
                                                    ? currentTerritories.filter(t => t !== territory)
                                                    : [...currentTerritories, territory];
                                                setValue('territory', newTerritories);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${(watch('territory') || []).includes(territory)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{territory}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="territory" control={control} className="mt-2" />
                            </div>
                        </div>
                    </div>
                );

            case 'tools-fields':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="space-y-4">
                                <FormLabel className="text-lg font-medium text-gray-900">Tools & Technologies</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TOOLS_USED.map((tool, index) => (
                                        <button
                                            key={tool}
                                            type="button"
                                            onClick={() => {
                                                const currentTools = watch('tools_used') || [];
                                                const newTools = currentTools.includes(tool)
                                                    ? currentTools.filter(t => t !== tool)
                                                    : [...currentTools, tool];
                                                setValue('tools_used', newTools);
                                            }}
                                            className={`flex items-center gap-3 w-full p-4 text-center rounded-lg border transition-colors ${(watch('tools_used') || []).includes(tool)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-medium text-gray-600">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="font-medium">{tool}</span>
                                        </button>
                                    ))}
                                </div>
                                <FieldToggles name="tools_used" control={control} className="mt-2" />
                            </div>
                        </div>
                    </div>
                );

            case 'review':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                            <p className="text-lg text-gray-600">{step.description}</p>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                                        <p><strong>Company:</strong> {watch('company_name') || 'Not specified'}</p>
                                        <p><strong>Job Title:</strong> {watch('job_title') || 'Not specified'}</p>
                                        <p><strong>Location:</strong> {watch('location_type')} {watch('city') && `- ${watch('city')}`}</p>
                                        <p><strong>Role Type:</strong> {watch('role_type')}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Key Details</h4>
                                        <p><strong>Primary Focus:</strong> {watch('primary_focus')}</p>
                                        <p><strong>Sales Team Size:</strong> {watch('sales_team_size')}</p>
                                        <p><strong>Sales Cycle:</strong> {watch('sales_cycle')}</p>
                                        <p><strong>Experience Required:</strong> {watch('experience_required')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white border rounded-lg p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900">Job Description Preview</h3>
                                    {isGeneratingDescription && <span className="text-sm text-gray-500">Generating...</span>}
                                </div>
                                {generatedBadges.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {generatedBadges.map((b, i) => (
                                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">{b}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="prose max-w-none text-gray-800">
                                    {generatedDescription
                                        ? <ReactMarkdown>{generatedDescription}</ReactMarkdown>
                                        : 'Click "Create Job Description" to generate a preview.'}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Step not implemented</div>;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
            </div>

            {/* Step Navigation */}
            <div className="fixed top-4 right-4 z-40">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-900 mb-2">Step {currentStep + 1} of {totalSteps}</div>
                    <div className="flex gap-1">
                        {formSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToStep(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? 'bg-blue-600' :
                                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Current Step */}
                        <div className="min-h-[400px] flex items-center justify-center">
                            {renderStep(formSteps[currentStep])}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="px-8 py-3"
                            >
                                Previous
                            </Button>

                            {currentStep < totalSteps - 1 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                                >
                                    Next
                                </Button>
                            ) : (
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={!isValid || Object.keys(errors).length > 0 || isGeneratingDescription}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                                    >
                                        {isGeneratingDescription ? 'Generating…' : 'Create Job Description'}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleCreateJob}
                                        disabled={!jobRolePayloadState || isCreatingJob}
                                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                                    >
                                        {isCreatingJob ? 'Creating…' : 'Create Job'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
