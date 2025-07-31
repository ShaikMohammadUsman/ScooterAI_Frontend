export interface FilterState {
    // Location filter
    location: string;
    
    // Application Status filters
    audioAttended: boolean;
    videoInterviewSent: boolean;
    videoAttended: boolean;
    sendToHiringManager: boolean;
    
    // Experience Filters
    experienceRange: string;
    salesExperienceRange: string;
} 