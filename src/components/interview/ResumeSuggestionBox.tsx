import React from "react";
import { FaFilePdf, FaExternalLinkAlt, FaRegLightbulb } from "react-icons/fa";
import { MdOutlineFormatShapes } from "react-icons/md";
import { SiOverleaf, SiCanva, SiGoogleforms } from "react-icons/si";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const resumeSites = [
    {
        name: "Overleaf (LaTeX)",
        url: "https://www.overleaf.com/latex/templates/tagged/cv",
        icon: <SiOverleaf className="text-green-700 w-6 h-6" />,
        desc: "Professional LaTeX templates for structured resumes."
    },
    {
        name: "Canva Resume Builder",
        url: "https://www.canva.com/resumes/templates/",
        icon: <SiCanva className="text-blue-600 w-6 h-6" />,
        desc: "Easy drag-and-drop resume templates."
    },
    {
        name: "Google Docs Resume Templates",
        url: "https://docs.google.com/document/u/0/?ftv=1&tgif=d",
        icon: <SiGoogleforms className="text-blue-500 w-6 h-6" />,
        desc: "Free, clean templates from Google Docs."
    },
    {
        name: "Novoresume",
        url: "https://novoresume.com/resume-templates",
        icon: <FaFilePdf className="text-red-500 w-6 h-6" />,
        desc: "Modern, ATS-friendly resume templates."
    }
];

export default function ResumeSuggestionBox() {
    return (
        <Card className="mt-6 p-6 bg-yellow-50 border-yellow-200 shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
                <FaRegLightbulb className="text-yellow-500 w-7 h-7" />
                <h2 className="text-xl font-bold text-yellow-900">Need help with your resume?</h2>
            </div>
            <p className="mb-4 text-yellow-900 text-base">
                Our system couldn't parse your resume. For best results, use a <span className="font-semibold">well-structured, clean, and preferably LaTeX-based</span> resume. Avoid images, tables, or unusual formatting.<br />
                Try one of these popular, free resume builders:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {resumeSites.map(site => (
                    <a
                        key={site.name}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-lg transition"
                    >
                        {site.icon}
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900 flex items-center gap-1">
                                {site.name}
                                <FaExternalLinkAlt className="inline ml-1 w-3 h-3 text-gray-400" />
                            </div>
                            <div className="text-xs text-gray-600">{site.desc}</div>
                        </div>
                    </a>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-yellow-900">
                <MdOutlineFormatShapes className="w-5 h-5 text-yellow-700" />
                <span>
                    Tip: Use clear section headings, standard fonts, and export as PDF for best parsing accuracy.
                </span>
            </div>
        </Card>
    );
} 