import { Hexagon, Linkedin } from "lucide-react"
import { Footer } from "@/components/saasboomiUI/footer"

function Demo() {
  return (
    <div className="w-full">
      <Footer
        logo={<Hexagon className="h-10 w-10" />}
        brandName="Awesome Corp"
        socialLinks={[
          {
            icon: <Linkedin className="h-5 w-5" />,
            href: "https://www.linkedin.com/company/scooter-ai/",
            label: "Twitter",
          },
        ]}
        mainLinks={[
          { href: "/", label: "Home" },
          { href: "/saasboomi#about", label: "About" },
          { href: "/saasboomi#pricing", label: "Pricing" },
          { href: "/saasboomi#about", label: "Contact" },
        ]}
        legalLinks={[
          { href: "/saasboomi#privacy", label: "Privacy" },
          { href: "/saasboomi#terms", label: "Terms" },
        ]}
        copyright={{
          text: "© 2025 Scooter",
          license: "All rights reserved",
        }}
      />
    </div>
  )
}

export { Demo }