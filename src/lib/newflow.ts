interface SignupBody{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface SignupResponse{
    status: boolean;
    message: string;
    data:{
        email: string;
        firstName: string;
        lastName: string;
    }
}

interface LoginBody{
    email:string;
    password: string;
}

interface LoginResponse{
    status: boolean;
    message: string;
    data:{
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        last_login: string; //iso string
    }
}


interface ContactUsBody{
    name: string;
    designation:string;
    companyName:string;
    companyEmail:string;
    query:string | undefined;
}

interface ContactUsResponse{
    status:boolean;
    message:string;
}


interface JDBasicInfo {
    companyName:string;
    jobTitle:string;
    roleType:string;
    primaryFocus:string[];
    salesProcessStages:string[];
}

enum workLocationEnum{
    INPERSON = "inPerson",
    HYBRID = "hybrid",
    REMOTE = "remote"
}

interface JDExperienceSkills{
    minExp: number | null;
    maxExp:number | null;
    skillsRequired:string[];
    workLocation: workLocationEnum;
    location: string[];
    timeZone:string[];
}


interface JDCompensations{
    baseSalary: {
        currency:string;
        minSalary:number;
        maxSalary:number;
        cadence:string; //yearly / monthly
    }
    ote: string[];
    equityOffered: boolean;
    opportunities: string[];
    keyChallenged: string[];
    laguages:string[];
}

//method PUT
// createJob?stage=1
//stage -1 => check for basicInfo in the body and so on
// stage -2 => experienceSkills
//stage - 3 => compensations
interface JDCreationBody{
    basicInfo?:JDBasicInfo;
    experienceSkills?:JDExperienceSkills;
    compensations?:JDCompensations;
    isCompleted:boolean;
}

interface JDCreationResponse{
    status:boolean;
    message:string;
    data:{
        jobId:string;
        basicInfo:JDBasicInfo;
        experienceSkills:JDExperienceSkills | null;
        compensations:JDCompensations | null;
        isCompleted:boolean;
    }
}


//POST ai-jd-creation

interface AIJDCreationBody{
    jobDescription:string;
}

interface AIJDCreationResponse{
    status:boolean;
    message:string;
    data:{
        jobId:string;
        basicInfo:JDBasicInfo;
        experienceSkills:JDExperienceSkills | null;
        compensations:JDCompensations | null;
        isCompleted:boolean;
    }
}

interface ScheduleInterviewBody{
        applicantName:string;
        interviewerName?:string;
        jobId: string,
        profileId: string,
        selectedDate: string, //date
        selectedSlots: string[]
}

interface ScheduleInterviewResponse {
    status:boolean;
    message:string;
    data:{
        interviewId:string;
    }
}

//an endpoint to get the list of interview
//an endpoint to get the details of an interview