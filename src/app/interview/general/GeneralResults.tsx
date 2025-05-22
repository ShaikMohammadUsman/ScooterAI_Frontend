import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { EvaluateInterviewResponse } from "@/lib/interviewService";

export default function GeneralResults({ evaluation }: { evaluation: EvaluateInterviewResponse }) {
    const router = useRouter();
    // Render analytics/results
    if (!evaluation) return null;
    const { interview_summary, qa_evaluations } = evaluation;


    return (
        <Card className="w-full max-w-2xl mx-auto mt-8 p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Interview Results</h2>
            <div className="mb-4 flex flex-wrap gap-4">
                <Badge className="bg-green-100 text-green-800">Avg. Score: {interview_summary.average_score.toFixed(2)}</Badge>
                <Badge className="bg-blue-100 text-blue-800">Total Questions: {interview_summary.total_questions}</Badge>
            </div>
            <div className="mb-6">
                <h3 className="font-semibold mb-2">Dimension Averages</h3>
                {Object.entries(interview_summary.dimension_averages).map(([dim, val]) => (
                    <div key={dim} className="mb-2">
                        <span className="capitalize font-medium">{dim.replace("_", " ")}: </span>
                        <Progress value={val * 20} className="w-1/2 inline-block align-middle mx-2" />
                        <span className="ml-2 font-semibold">{val.toFixed(2)}/5</span>
                    </div>
                ))}
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-2">Strengths</h3>
                <ul className="list-disc ml-6">
                    {interview_summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                <ul className="list-disc ml-6">
                    {interview_summary.areas_for_improvement.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-2">Q&A Evaluations</h3>
                {qa_evaluations.map((qa, i) => (
                    <Card key={i} className="mb-2 p-2 bg-muted">
                        <div className="font-semibold">Q{i + 1}: {qa.question}</div>
                        <div className="mb-1">A: {qa.answer}</div>
                        <div className="text-sm text-muted-foreground">{qa.evaluation.summary}</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(qa.evaluation).filter(([k]) => k !== "summary" && k !== "overall_score").map(([k, v]: any) => (
                                <Badge key={k} className="bg-primary/10 text-primary font-medium">{k}: {v.score}/5</Badge>
                            ))}
                            <Badge className="bg-green-100 text-green-800">Overall: {qa.evaluation.overall_score}/5</Badge>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="mb-2 text-center">
                <Button onClick={() => {
                    // window.location.reload();
                    router.push(`/interview/communication`);
                }} className="mt-2">Continue to Next Interview</Button>
            </div>
        </Card>
    );

};