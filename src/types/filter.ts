export interface FilterState {
    // Location filter
    location: string;
    
    // Application Status filters
    audioAttended: boolean;
    videoInterviewSent: boolean;
    videoAttended: boolean;
    sendToHiringManager: boolean;
    profileOnly: boolean; // New filter for candidates who only created profile
    
    // Experience Filters
    experienceRange: string;
    salesExperienceRange: string;
} 