import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./index.css";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import ClientProviders from "./ClientProviders";
import SupportPanel from "@/components/SupportPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScooterAI",
  description: "The Next Generation Sales Hiring. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <Toaster />
          <Suspense fallback={<InterviewLoading />}>
            {children}
          </Suspense>
          <SupportPanel />
        </ClientProviders>
      </body>
    </html>
  );
}

function InterviewLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg text-muted-foreground">Getting things ready for you...</p>
      </div>
    </div>
  );
}