"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    title: "Product Designer",
    description:
      "Design intuitive and delightful user experiences that shape how people interact with Scooter’s products.",
    badges: [
      { label: "UX/UI", className: "bg-pink-100 text-pink-800" },
      { label: "Figma, Framer", className: "bg-indigo-100 text-indigo-800" },
      { label: "Remote", className: "bg-gray-100 text-gray-800" },
    ],
    queryParam: "product designer",
  },
  {
    title: "Software Engineer",
    description:
      "Build scalable, high-performance systems that power Scooter's platform used by thousands of customers daily.",
    badges: [
      { label: "Full Stack", className: "bg-blue-100 text-blue-800" },
      { label: "2+ Years Experience", className: "bg-orange-100 text-orange-800" },
      { label: "Delhi/Remote", className: "bg-location text-foreground" },
    ],
    queryParam: "software engineer",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-6 border-b border-muted bg-white/80">
        <div className="text-2xl font-bold text-primary">Scooter</div>
        <nav className="flex gap-8 text-muted-foreground font-medium text-lg">
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Careers</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-12 bg-background">
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-foreground mb-4">
          Begin Your Journey at <span className="text-primary">Scooter</span>
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-2">
          Join our growing team across disciplines and shape the future of mobility.
        </p>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl">
          We’re hiring for multiple roles — from sales and marketing to engineering and design. Apply today!
        </p>

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

      {/* Footer */}
      <footer className="w-full text-center text-muted-foreground py-6 border-t border-muted bg-white/80 text-sm">
        © 2025 Scooter Technologies. All rights reserved.
      </footer>
    </div>
  );
}
