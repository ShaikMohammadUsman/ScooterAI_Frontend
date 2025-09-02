import axios from "axios";

const CLIENT_API_BASE = "https://scooter-client.salmonpebble-101e17d0.canadacentral.azurecontainerapps.io";

export interface UploadResumesResponseOK {
  results: {
    _id: string;
    name: string;
    created_at: string;
    status: string;
    assessments: Array<{
      file_name: string;
      job_fit_assessment: string;
    }>;
  };
}

export interface UploadResumesResponseError {
  detail: string;
}

export type UploadResumesResponse = UploadResumesResponseOK | UploadResumesResponseError;

export interface ReportSummary {
  _id: string;
  name: string;
  created_at: string;
}

export interface ReportsListResponse {
  reports: ReportSummary[];
}

export interface ReportDetailsResponse {
  _id: string;
  name: string;
  created_at: string;
  status: string;
  assessments: Array<{
    file_name: string;
    job_fit_assessment: string;
  }>;
}

export async function uploadResumesZip(params: {
  zip_file: File | Blob;
  job_description: string;
  name: string;
}): Promise<UploadResumesResponse> {
  const formData = new FormData();
  formData.append("zip_file", params.zip_file);
  formData.append("job_description", params.job_description);
  formData.append("name", params.name);

  try {
    const res = await axios.post(`${CLIENT_API_BASE}/upload-resumes/`, formData, {
      headers: {
        "accept": "application/json",
        "Content-Type": "multipart/form-data",
      },
      // Prevent axios from throwing on 404 so we can surface the message
      validateStatus: () => true,
    });
    return res.data as UploadResumesResponse;
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || err.response?.data?.message || "Failed to upload resumes");
  }
}

export async function listReports(): Promise<ReportsListResponse> {
    console.log(`${CLIENT_API_BASE}/list-reports`)
  const res = await axios.get(`${CLIENT_API_BASE}/list-reports/`);
  return res.data as ReportsListResponse;
}

export async function getReportDetails(id: string): Promise<ReportDetailsResponse> {
  const res = await axios.get(`${CLIENT_API_BASE}/results/${id}`);
  return res.data as ReportDetailsResponse;
}


