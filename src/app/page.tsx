import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-background">
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-foreground mb-4">
          Begin Your Journey at <span className="text-primary">Scooter</span>
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-2">
          Join our team of passionate sales professionals and help shape the future of mobility.
        </p>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl">
          We're looking for exceptional sales talent who can drive growth and build meaningful relationships with our customers.
        </p>
        <Card className="max-w-xl w-full mx-auto bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Senior Account Executive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-foreground">
              Build and grow relationships with enterprise customers across India, driving revenue and delivering exceptional client experiences.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-b2b text-primary-foreground">B2B Sales</Badge>
              <Badge className="bg-experience text-foreground">5+ Years Experience</Badge>
              <Badge className="bg-location text-foreground">Mumbai/Remote</Badge>
            </div>
            <Button className="w-full sm:w-auto px-8 py-2 text-base font-semibold">Apply Now</Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-muted-foreground py-6 border-t border-muted bg-white/80 text-sm">
        © 2025 Scooter Technologies. All rights reserved.
      </footer>
    </div>
  );
}
