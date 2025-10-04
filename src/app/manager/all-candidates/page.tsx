"use client";
import AllCandidatesCard from "@/components/company/cards/AllCandidatesCard";
import { getMyJobCandidates, ManagerCandidate } from "@/lib/managerService";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react"; // for tick icon

function Page() {
    const jobId = useSearchParams().get("job_id");
    const [allCandidate, setAllCandidates] = useState<ManagerCandidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState<any>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<{
        type: "audio" | "video";
        link: string;
        candidateName: string;
        candidateId: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchAllCandidate = async (page = 1) => {
        if (!jobId) return;
        setLoading(true);
        setError("");
        try {
            const response = await getMyJobCandidates(jobId, page, 10);

            if (response?.status) {
                setAllCandidates(response.candidates);
                setPaginationInfo(response.pagination);
                setTotalPages(response.pagination.total_pages);
                setCurrentPage(response.pagination.current_page);
            } else {
                setAllCandidates([]);
                setError("No candidates found.");
            }
        } catch (error) {
            console.error(error);
            setError("Something went wrong while fetching candidates.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCandidate(1);
    }, [jobId]);

    const generateLink = (type: "audio" | "video", candidateId: string) => {
        const baseUrl = window.location.origin;
        return type === "audio"
            ? `${baseUrl}/interview/general?application_id=${candidateId}`
            : `${baseUrl}/interview/communication?application_id=${candidateId}`;
    };

    const openPopup = (type: "audio" | "video", candidateId: string, candidateName: string) => {
        const link = generateLink(type, candidateId);
        setModalData({ type, link, candidateName, candidateId });
        setShowModal(true);
        setCopied(false);
    };

    const onSendAudioLink = (candidateId: string, candidateName: string, candidateEmail: string) => {
        openPopup("audio", candidateId, candidateName);
    };

    const onSendVideoLink = (candidateId: string, candidateName: string, candidateEmail: string) => {
        openPopup("video", candidateId, candidateName);
    };

    const copyToClipboard = () => {
        if (modalData) {
            navigator.clipboard.writeText(modalData.link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchAllCandidate(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center">
                <div className="mx-auto h-16 w-16 rounded-full border-2 border-grad-1 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center text-gray-700">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen max-w-6xl mx-auto py-8 flex flex-col justify-center gap-4">
            {allCandidate?.map((candidate, index) => (
                <div key={index}>
                    <AllCandidatesCard
                        candidate={candidate}
                        jobId={jobId as string}
                        onSendAudioLink={onSendAudioLink}
                        onSendVideoLink={onSendVideoLink}
                    />
                </div>
            ))}

            {/* Pagination Controls */}
            {paginationInfo && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        disabled={!paginationInfo.has_previous}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`px-4 py-2 rounded-lg border ${paginationInfo.has_previous
                            ? "bg-white hover:bg-gray-100"
                            : "bg-gray-200 cursor-not-allowed"
                            }`}
                    >
                        Previous
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg border ${currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "bg-white hover:bg-gray-100"
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        disabled={!paginationInfo.has_next}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`px-4 py-2 rounded-lg border ${paginationInfo.has_next
                            ? "bg-white hover:bg-gray-100"
                            : "bg-gray-200 cursor-not-allowed"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Popup Modal */}
            {showModal && modalData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg relative animate-fadeIn">
                        <h2 className="text-lg font-semibold mb-2">
                            {modalData.type === "audio" ? "Audio Interview Link" : "Video Interview Link"}
                        </h2>
                        <p className="text-sm text-gray-600 mb-1">
                            <strong>Candidate:</strong> {modalData.candidateName}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                            <strong>ID:</strong> {modalData.candidateId}
                        </p>
                        <div className="bg-gray-100 border rounded p-2 text-sm break-all mb-3">
                            {modalData.link}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${copied ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Copied!
                                    </>
                                ) : (
                                    "Copy Link"
                                )}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;
