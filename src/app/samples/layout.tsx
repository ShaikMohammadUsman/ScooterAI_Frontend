import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Candidate Portfolio - Scooter AI',
    description: 'View detailed candidate profiles and interview performances',
};

export default function CandidatePortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
