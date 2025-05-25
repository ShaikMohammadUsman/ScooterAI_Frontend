'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

const roles = [
    {
        title: "Senior Account Executive",
        description:
            "Build and grow relationships with enterprise customers across India, driving revenue and delivering exceptional client experiences.",
        badges: [
            { label: "B2B Sales", className: "bg-b2b text-primary-foreground" },
            { label: "5+ Years Experience", className: "bg-experience text-foreground" },
            { label: "Mumbai/Remote", className: "bg-location text-foreground" },
        ],
        queryParam: "senior account executive",
    },
    {
        title: "Marketing Manager",
        description:
            "Develop and execute strategic marketing campaigns that amplify our brand and drive customer acquisition.",
        badges: [
            { label: "Brand Strategy", className: "bg-purple-200 text-purple-800" },
            { label: "3+ Years Experience", className: "bg-yellow-100 text-yellow-800" },
            { label: "Bangalore", className: "bg-green-100 text-green-800" },
        ],
        queryParam: "marketing manager",
    },
    {
        title: "Sales Development Representative",
        description:
            "Proactively identify and qualify new business opportunities, building the foundation for our sales pipeline.",
        badges: [
            { label: "Lead Generation", className: "bg-blue-100 text-blue-800" },
            { label: "1+ Years Experience", className: "bg-orange-100 text-orange-800" },
            { label: "Remote", className: "bg-location text-foreground" },
        ],
        queryParam: "sales development representative",
    },
    {
        title: "Digital Marketing Specialist",
        description:
            "Create and optimize digital marketing campaigns across multiple channels to drive brand awareness and lead generation.",
        badges: [
            { label: "Social Media", className: "bg-pink-100 text-pink-800" },
            { label: "2+ Years Experience", className: "bg-yellow-100 text-yellow-800" },
            { label: "Delhi/Remote", className: "bg-location text-foreground" },
        ],
        queryParam: "digital marketing specialist",
    },
];

function CareersPage() {

    const router = useRouter();
    return (
        <div className="min-h-screen bg-background flex flex-col mt-20">

            <main className="flex-1 flex flex-col items-center px-4 py-12 bg-background">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
                    {roles.map((role, idx) => (
                        <Card key={idx} className="bg-card shadow-lg">
                            <CardHeader>
                                <CardTitle>{role.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-foreground">{role.description}</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {role.badges.map((badge, i) => (
                                        <Badge key={i} className={badge.className}>{badge.label}</Badge>
                                    ))}
                                </div>
                                <Button
                                    className="w-full sm:w-auto px-8 py-2 text-base font-semibold"
                                    onClick={() => router.push(`/resume?role=${role.queryParam}`)}
                                >
                                    Apply Now
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default CareersPage;