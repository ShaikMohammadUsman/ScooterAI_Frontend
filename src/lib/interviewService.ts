import axios from "axios";

const API_BASE = "https://scooter-backend.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";
// const API_BASE = "https://scooter-test.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";


// -------------------------------------------------------------------------------------------------------------------

// INTERVIEW QUESTIONS
export interface GenerateInterviewQuestionsRequest {
  posting_title: string;
  profile_id: string;
}
export interface GenerateInterviewQuestionsResponse {
  questions: string[];
}

export async function generateInterviewQuestions(
  data: GenerateInterviewQuestionsRequest
): Promise<GenerateInterviewQuestionsResponse> {
  try {
    const res = await axios.post(`${API_BASE}/generate-interview-questions/`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to generate interview questions");
  }
}

// INTERVIEW EVALUATION
export interface QAPair {
  question: string;
  answer: string;
}
export interface EvaluateInterviewRequest {
  qa_pairs: QAPair[];
  user_id: string;
}
export interface QAEvaluation {
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
}
export interface InterviewSummary {
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
}
export interface EvaluateInterviewResponse {
  status: boolean;
  message: string;
  qualified_for_video_round: boolean;
}

export async function evaluateInterview(
  data: EvaluateInterviewRequest
): Promise<EvaluateInterviewResponse> {
  try {
    const res = await axios.post(`${API_BASE}/evaluate-interview/`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to evaluate interview");
  }
}

// -------------------------------------------------------------------------------------------------------------------

// CONVERSATIONAL INTERVIEW
export interface ConversationalInterviewInitRequest {
  role: string;
  user_id: string;
  flag: string;
}
export interface ConversationalInterviewContinueRequest {
  session_id: string;
  user_answer: string;
}
export interface ConversationalInterviewResponse {
  session_id: string;
  trait: string;
  question: string;
  step: string;
  status?: string;
    message?: string;
}

export async function startConversationalInterview(
  data: ConversationalInterviewInitRequest
): Promise<ConversationalInterviewResponse> {
  const formData = new FormData();
  formData.append("role", data.role);
  formData.append("user_id", data.user_id);
  formData.append("flag", data.flag);
  try {
    const res = await axios.post(`${API_BASE}/conversational-interview/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || err.response?.data?.message || "Failed to start conversational interview");
  }
}

export async function continueConversationalInterview(
  data: ConversationalInterviewContinueRequest
): Promise<ConversationalInterviewResponse> {
  const formData = new FormData();
  formData.append("session_id", data.session_id);
  formData.append("user_answer", data.user_answer);
  try {
    const res = await axios.post(`${API_BASE}/conversational-interview/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || err.response?.data?.message || "Failed to continue conversational interview");
  }
} 


// EVALUATE COMMUNICATION
export interface CommunicationDimension {
    score: number;
    feedback: string;
  }
  export interface EvaluateCommunicationResponse {
    content_and_thought: CommunicationDimension;
    verbal_delivery: CommunicationDimension;
    non_verbal: CommunicationDimension;
    presence_and_authenticity: CommunicationDimension;
    overall_score: number;
    summary: string;
  }
  
  export async function evaluateCommunication(session_id: string): Promise<EvaluateCommunicationResponse> {
    try {
      const res = await axios.post(`${API_BASE}/evaluate-communication/${session_id}`, {}, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to evaluate communication");
    }
  }

// -------------------------------------------------------------------------------------------------------------------

// SALES SCENARIOS
export interface StartSalesScenarioRequest {
  role_type: string;
  buyer_profile: string;
  user_id: string;
}
export interface SalesScenarioResponse {
  session_id: string;
  scenario: string;
  step: string;
  scenario_type: string;
}

export async function startSalesScenario(
  data: StartSalesScenarioRequest
): Promise<SalesScenarioResponse> {
  const formData = new FormData();
  formData.append("role_type", data.role_type);
  formData.append("buyer_profile", data.buyer_profile);
  formData.append("user_id", data.user_id);
  try {
    const res = await axios.post(`${API_BASE}/start-sales-scenario/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || err.response?.data?.message || "Failed to start sales scenario");
  }
}

export interface ContinueSalesScenarioRequest {
  session_id: string;
  user_response: string;
}

export async function continueSalesScenario(
  data: ContinueSalesScenarioRequest
): Promise<SalesScenarioResponse> {
  const formData = new FormData();
  formData.append("session_id", data.session_id);
  formData.append("user_response", data.user_response);
  try {
    const res = await axios.post(`${API_BASE}/continue-sales-scenario/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || err.response?.data?.message || "Failed to continue sales scenario");
  }
}

// UPLOAD INTERVIEW VIDEO
interface UploadVideoRequest {
    file: File;
    user_id: string;
    onProgress?: (progress: number) => void;
}

export async function uploadInterviewVideo({ file, user_id, onProgress }: UploadVideoRequest): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user_id);

    try {
        await axios.post(`${API_BASE}/upload-video/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const progress = progressEvent.loaded / progressEvent.total;
                    onProgress(progress);
                }
            },
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;
    }
}

// -------------------------------------------------------------------------------------------------------------------

// VIDEO INTERVIEW LOGIN
export interface VideoInterviewLoginRequest {
  email: string;
  code: string;
}

export interface VideoInterviewLoginResponse {
  status: boolean;
  message: string;
  user_id: string | null;
  full_name: string | null;
}

export async function videoInterviewLogin(
  data: VideoInterviewLoginRequest
): Promise<VideoInterviewLoginResponse> {
  try {
    const res = await axios.post(`${API_BASE}/video-interview-login/`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to verify interview access");
  }
}

// -------------------------------------------------------------------------------------------------------------------