import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MilestoneStatus = "completed" | "in-progress" | "planned";

interface Milestone {
  title: string;
  description: string;
  status: MilestoneStatus;
  quarter?: string;
  features: string[];
}

const milestones: Milestone[] = [
  {
    title: "Platform Foundation",
    description: "Core infrastructure and authentication system",
    status: "completed",
    quarter: "Q1 2025",
    features: [
      "User authentication with Google OAuth",
      "Project management system",
      "Subscription and payment integration",
      "Basic calculator interface",
    ],
  },
  {
    title: "Carbon Calculation Engine",
    description: "Comprehensive emission tracking across all scopes",
    status: "completed",
    quarter: "Q2 2025",
    features: [
      "Scope 1, 2, and 3 emissions tracking",
      "Life Cycle Assessment (LCA) framework",
      "Australian emission factors database",
      "Report generation and export",
    ],
  },
  {
    title: "Data & Performance",
    description: "EPD database and platform optimization",
    status: "completed",
    quarter: "Q2 2025",
    features: [
      "4,000+ EPD materials database import",
      "EPD-centric schema for compliance",
      "Performance optimization for Core Web Vitals",
      "Image optimization and lazy loading",
    ],
  },
  {
    title: "Security Hardening",
    description: "Enterprise-grade security and validation",
    status: "completed",
    quarter: "Q2 2025",
    features: [
      "Server-side input validation",
      "Rate limiting across endpoints",
      "Row-level security policies",
      "Audit logging and monitoring",
    ],
  },
  {
    title: "AI-Powered Features",
    description: "Intelligent automation and insights",
    status: "completed",
    quarter: "Q4 2025",
    features: [
      "AI-powered BOQ import and parsing",
      "Carbon reduction recommendations",
      "Material substitution suggestions",
      "Automated compliance checking",
    ],
  },
  {
    title: "Advanced Analytics",
    description: "Deep insights and benchmarking",
    status: "completed",
    quarter: "Q4 2025",
    features: [
      "Project comparison and benchmarking",
      "Industry-specific carbon intensity metrics",
      "Predictive carbon modeling",
      "Custom dashboard builder",
    ],
  },
  {
    title: "Compliance & Certification",
    description: "Australian building standards integration",
    status: "planned",
    quarter: "Q1 2026",
    features: [
      "NCC Section J compliance automation",
      "Green Star integration",
      "NABERS rating support",
      "Government reporting templates",
    ],
  },
  {
    title: "Collaboration Tools",
    description: "Team workflows and integrations",
    status: "planned",
    quarter: "Q2 2026",
    features: [
      "Multi-user project collaboration",
      "Real-time data synchronization",
      "Third-party tool integrations (BIM, estimating)",
      "API access for custom workflows",
    ],
  },
];

const statusConfig: Record<MilestoneStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", label: "Completed" },
  "in-progress": { icon: Clock, color: "text-blue-600 dark:text-blue-400", label: "In Progress" },
  planned: { icon: Circle, color: "text-muted-foreground", label: "Planned" },
};

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Platform Roadmap
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our transparent development journey. See what we've built, what we're building, and what's coming next.
          </p>
        </div>

        {/* Milestones Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          <div className="space-y-8">
            {milestones.map((milestone, index) => {
              const StatusIcon = statusConfig[milestone.status].icon;
              const iconColor = statusConfig[milestone.status].color;
              const statusLabel = statusConfig[milestone.status].label;

              return (
                <div
                  key={index}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 -translate-x-1/2 hidden md:block">
                    <div className={`w-4 h-4 rounded-full border-4 border-background ${milestone.status === "completed" ? "bg-green-600" : milestone.status === "in-progress" ? "bg-blue-600" : "bg-muted"}`} />
                  </div>

                  {/* Card */}
                  <Card className="md:ml-16 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusIcon className={`w-5 h-5 ${iconColor}`} />
                            <Badge variant={milestone.status === "completed" ? "default" : milestone.status === "in-progress" ? "secondary" : "outline"}>
                              {statusLabel}
                            </Badge>
                            {milestone.quarter && (
                              <span className="text-sm text-muted-foreground">{milestone.quarter}</span>
                            )}
                          </div>
                          <CardTitle className="text-2xl">{milestone.title}</CardTitle>
                          <CardDescription className="mt-2 text-base">
                            {milestone.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {milestone.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${milestone.status === "completed" ? "bg-green-600" : milestone.status === "in-progress" ? "bg-blue-600" : "bg-muted-foreground"}`} />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center p-8 rounded-lg bg-muted/50 backdrop-blur-sm animate-fade-in">
          <h3 className="text-xl font-semibold mb-2">Have a feature request?</h3>
          <p className="text-muted-foreground mb-4">
            We're building CarbonConstruct for the Australian construction industry. Your feedback shapes our roadmap.
          </p>
          <p className="text-sm text-muted-foreground">
            Contact us at <a href="mailto:support@carbonconstruct.com.au" className="text-primary hover:underline">support@carbonconstruct.com.au</a>
          </p>
        </div>
      </div>
    </div>
  );
}
