import React from 'react'

export default function Home() {
    return (
        <div className="min-h-[calc(100vh-5rem)] bg-background flex flex-col">

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-background">
                <h1 className="text-4xl sm:text-5xl font-bold text-center text-foreground mb-4">
                    Begin Your Journey at <span className="text-primary">Scooter</span>
                </h1>
                <p className="text-xl text-center text-muted-foreground mb-2">
                    Join our growing team across disciplines and shape the future of mobility.
                </p>
                <p className="text-center text-muted-foreground mb-8 max-w-2xl">
                    We’re hiring for multiple roles — from sales and marketing to engineering and design. Apply today!
                </p>

            </main>


        </div>
    )
}