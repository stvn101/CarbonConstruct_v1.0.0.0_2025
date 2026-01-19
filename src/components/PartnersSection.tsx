import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, ExternalLink, ArrowRight } from "lucide-react";
import UnitedFacadeLogo from "@/assets/UnitedFacade-Logo.png";
import BuildingTransparencyLogo from "@/assets/BuildingTransparency-Logo.avif";
import CircularEcologyLogo from "@/assets/CircularEcology-Logo.jpg";

interface Partner {
  name: string;
  description: string;
  logo?: string;
  logoBg?: string;
  url?: string;
  category: "data" | "industry" | "certification";
}

const partners: Partner[] = [
  {
    name: "Building Transparency",
    description: "EC3 Global Database — 90,000+ verified Environmental Product Declarations.",
    logo: BuildingTransparencyLogo,
    logoBg: "bg-slate-900",
    url: "https://buildingtransparency.org",
    category: "data",
  },
  {
    name: "Circular Ecology",
    description: "ICE Database provider — Inventory of Carbon and Energy for embodied carbon data.",
    logo: CircularEcologyLogo,
    logoBg: "bg-white",
    url: "https://circularecology.com",
    category: "data",
  },
  {
    name: "United Facade",
    description: "Premium facade solutions and sustainable building envelope specialists.",
    logo: UnitedFacadeLogo,
    logoBg: "bg-white",
    url: "https://unitedfacade.com.au",
    category: "industry",
  },
];

const categoryLabels = {
  data: { label: "Data Partner", className: "bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-600/40" },
  industry: { label: "Industry Partner", className: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-600/40" },
  certification: { label: "Certification", className: "bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/40" },
};

export function PartnersSection() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-5xl mx-auto animate-fade-in [animation-delay:0.78s]">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Handshake className="h-6 w-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold">Partners & Integrations</h2>
        </div>
        <p className="text-muted-foreground">
          Trusted data sources and industry partnerships powering our carbon intelligence
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {partners.map((partner) => (
          <Card
            key={partner.name}
            variant="glass"
            className="group cursor-pointer glass-glow-hover transition-all duration-300 hover:-translate-y-1"
            onClick={() => partner.url && window.open(partner.url, "_blank", "noopener,noreferrer")}
          >
            <CardContent className="p-5 flex flex-col h-full">
              {/* Logo/Name Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {partner.logo ? (
                    <div className={`w-12 h-12 rounded-lg ${partner.logoBg || "bg-slate-800"} flex items-center justify-center p-2 flex-shrink-0`}>
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {partner.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate flex items-center gap-1.5">
                      {partner.name}
                      {partner.url && (
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <Badge className={`w-fit mb-3 text-xs ${categoryLabels[partner.category].className}`}>
                {categoryLabels[partner.category].label}
              </Badge>

              {/* Description */}
              <p className="text-sm text-muted-foreground flex-1">
                {partner.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All & CTA */}
      <div className="text-center mt-6 space-y-3">
        <Button 
          variant="outline" 
          onClick={() => navigate("/partners")}
          className="hover-scale"
        >
          View All Partners
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground">
          Want to partner with CarbonConstruct?{" "}
          <a
            href="/partners#inquiry"
            className="text-primary hover:underline"
          >
            Submit an inquiry
          </a>
        </p>
      </div>
    </div>
  );
}