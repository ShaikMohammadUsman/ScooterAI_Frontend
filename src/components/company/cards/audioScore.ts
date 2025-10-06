"use client";
import { Candidate } from "@/lib/adminService";
import { ManagerCandidate } from "@/lib/managerService";

// Returns 0–100 normalized score or null
export function getAudioSummaryScore(candidate: Candidate | any): number | null {
  const summary = candidate?.audio_interview_details?.audio_interview_summary
    || candidate?.audio_interview_summary; // fallback if placed at root
  if (!summary) return null;

  if (summary.average_score !== undefined) {
    if (summary.average_score > 20) {
      return summary.average_score; // assume 0–100
    } else {
      return summary.average_score * 20; // convert 0–5 → 0–100
    }
  }

  if (summary.dimension_averages) {
    const scores = Object.values(summary.dimension_averages).filter((s) => typeof s === "number") as number[];
    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avgScore * 20; // 0–5 → 0–100
    }
  }
  return null;
}

export function getFitLabel(candidate: ManagerCandidate): { label: string; className: string } {
  const score100 = getAudioSummaryScore(candidate);
  const normalized5 = score100 == null ? 0 : score100 / 20; // 0–5
  if (normalized5 >= 3.5) return { label: "Excellent Fit", className: "bg-lime-200 text-gray-800" };
  if (normalized5 >= 2.5) return { label: "Good Fit", className: "bg-yellow-200 text-gray-800" };
  return { label: "Moderate Fit", className: "bg-orange-200 text-gray-800" };
}


