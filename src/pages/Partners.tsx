import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Handshake, 
  ExternalLink, 
  Send, 
  Loader2, 
  CheckCircle, 
  Building2, 
  Database, 
  TrendingUp, 
  Globe,
  Users,
  Award,
  ArrowRight,
  Layers
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import UnitedFacadeLogo from "@/assets/UnitedFacade-Logo.png";
import BuildingTransparencyLogo from "@/assets/BuildingTransparency-Logo.webp";
import CircularEcologyLogo from "@/assets/CircularEcology-Logo.webp";

// Partner data with expanded information
interface PartnerProfile {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  logo?: string;
  logoBg?: string;
  url?: string;
  category: "data" | "industry" | "certification";
  caseStudy?: {
    title: string;
    description: string;
    metrics?: { label: string; value: string }[];
  };
  features: string[];
}

const partners: PartnerProfile[] = [
  {
    id: "building-transparency",
    name: "Building Transparency",
    shortDescription: "EC3 Global Database — 90,000+ verified Environmental Product Declarations.",
    fullDescription: "Building Transparency operates the EC3 (Embodied Carbon in Construction Calculator) database, providing access to over 90,000 verified EPDs from manufacturers worldwide. This integration enables CarbonConstruct Pro users to access the most comprehensive EPD database globally.",
    logo: BuildingTransparencyLogo,
    logoBg: "bg-slate-900",
    url: "https://buildingtransparency.org",
    category: "data",
    features: [
      "90,000+ verified EPDs",
      "Global manufacturer coverage",
      "Real-time API access",
      "Open data initiative"
    ],
    caseStudy: {
      title: "Global EPD Access",
      description: "Pro users can search and compare EPDs from the world's largest open database, enabling precise material selection based on verified carbon data.",
      metrics: [
        { label: "EPDs Available", value: "90K+" },
        { label: "Manufacturers", value: "5,000+" },
        { label: "Countries", value: "100+" }
      ]
    }
  },
  {
    id: "circular-ecology",
    name: "Circular Ecology",
    shortDescription: "ICE Database provider — Inventory of Carbon and Energy for embodied carbon data.",
    fullDescription: "Circular Ecology maintains the globally recognised ICE (Inventory of Carbon and Energy) database, the most comprehensive free resource for embodied carbon data. Their peer-reviewed emission factors form the backbone of our materials carbon calculations.",
    logo: CircularEcologyLogo,
    logoBg: "bg-white",
    url: "https://circularecology.com",
    category: "data",
    features: [
      "Peer-reviewed emission factors",
      "Global material coverage",
      "Regular data updates",
      "Academic methodology"
    ],
    caseStudy: {
      title: "Foundation of Accuracy",
      description: "The ICE database provides over 500 material emission factors used across our platform, ensuring scientifically validated carbon calculations.",
      metrics: [
        { label: "Materials Covered", value: "500+" },
        { label: "Data Quality", value: "Peer-Reviewed" },
        { label: "Global Standard", value: "Yes" }
      ]
    }
  },
  {
    id: "united-facade",
    name: "United Facade",
    shortDescription: "Queensland commercial construction — 17 years of Tier 1 site experience shaping CarbonConstruct.",
    fullDescription: "United Facade is Steven's Queensland-based commercial construction company specialising in steel-framed partitions, ceilings, curtain wall facade and carpentry work. With 17 years of hands-on site experience across Tier 1 projects in Queensland, the practical knowledge from running United Facade directly shaped how CarbonConstruct approaches carbon calculation.",
    logo: UnitedFacadeLogo,
    logoBg: "bg-white",
    url: "https://unitedfacade.com.au",
    category: "industry",
    features: [
      "Real project material selections",
      "Estimating-first workflows",
      "Carbon data integrated with quoting",
      "17 years Tier 1 experience"
    ],
    caseStudy: {
      title: "Builder-First Approach",
      description: "Most carbon tools are built by consultants who've never priced a job. CarbonConstruct was built by someone who has — focusing on materials and workflows that actually matter to builders, not theoretical compliance frameworks.",
      metrics: [
        { label: "Years Experience", value: "17+" },
        { label: "Location", value: "Queensland" },
        { label: "Approach", value: "Builder-First" }
      ]
    }
  }
];

const categoryLabels = {
  data: { label: "Data Partner", className: "bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-600/40", icon: Database },
  industry: { label: "Industry Partner", className: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-600/40", icon: Building2 },
  certification: { label: "Certification", className: "bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/40", icon: Award },
};

// Partnership inquiry form schema
const inquirySchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  contactName: z.string().trim().min(1, "Contact name is required").max(100, "Contact name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  website: z.string().trim().max(255, "Website must be less than 255 characters").optional().or(z.literal("")),
  partnershipType: z.string().trim().min(1, "Please select a partnership type"),
  message: z.string().trim().min(20, "Please provide more details (at least 20 characters)").max(2000, "Message must be less than 2000 characters"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

const Partners = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InquiryFormData>({
    companyName: "",
    contactName: "",
    email: "",
    website: "",
    partnershipType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof InquiryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof InquiryFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof InquiryFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Log partnership inquiry as analytics event
      await supabase.from("analytics_events").insert({
        event_name: "partnership_inquiry",
        page_url: "/partners",
        event_data: {
          company_name: result.data.companyName,
          contact_name: result.data.contactName,
          email: result.data.email,
          website: result.data.website || null,
          partnership_type: result.data.partnershipType,
          message: result.data.message,
          submitted_at: new Date().toISOString(),
        },
      });

      // Also send email via edge function
      await supabase.functions.invoke("send-contact-email", {
        body: {
          name: result.data.contactName,
          email: result.data.email,
          subject: `Partnership Inquiry: ${result.data.companyName} - ${result.data.partnershipType}`,
          message: `Company: ${result.data.companyName}\nWebsite: ${result.data.website || 'N/A'}\nPartnership Type: ${result.data.partnershipType}\n\n${result.data.message}`,
        },
      });

      setIsSubmitted(true);
      toast.success("Partnership inquiry submitted successfully!");
      setFormData({ companyName: "", contactName: "", email: "", website: "", partnershipType: "", message: "" });
    } catch (error: any) {
      console.error("Partnership inquiry error:", error);
      toast.error("Failed to submit inquiry. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Partners & Integrations | CarbonConstruct"
        description="Explore CarbonConstruct's strategic partnerships with industry leaders in sustainable construction, carbon data providers, and certification bodies. Join our partner ecosystem."
        canonicalPath="/partners"
      />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Handshake className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Partners & Integrations</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            CarbonConstruct is built on a foundation of trusted partnerships with industry leaders, 
            data providers, and sustainability experts. Together, we're making carbon compliance 
            accessible for Australian construction.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="px-4 py-2 text-sm bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-600/40">
              <Building2 className="h-4 w-4 mr-2" />
              Industry Partners
            </Badge>
            <Badge className="px-4 py-2 text-sm bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-600/40">
              <Database className="h-4 w-4 mr-2" />
              Data Providers
            </Badge>
            <Badge className="px-4 py-2 text-sm bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/40">
              <Award className="h-4 w-4 mr-2" />
              Certifications
            </Badge>
          </div>
          
          {/* Link to Integration Docs */}
          <div className="mt-8">
            <Button variant="outline" onClick={() => navigate("/partners/integrations")} className="hover-scale">
              <Layers className="mr-2 h-4 w-4" />
              View Data Source Integrations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Partner Profiles Grid */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Partners</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {partners.map((partner) => {
              const CategoryIcon = categoryLabels[partner.category].icon;
              return (
                <Card 
                  key={partner.id} 
                  variant="glass" 
                  className="glass-glow-hover transition-all duration-300 overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {partner.logo ? (
                          <div className={`w-16 h-16 rounded-xl ${partner.logoBg || "bg-slate-800"} flex items-center justify-center p-3 flex-shrink-0`}>
                            <img
                              src={partner.logo}
                              alt={`${partner.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl font-bold text-primary">
                              {partner.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {partner.name}
                            {partner.url && (
                              <a 
                                href={partner.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </CardTitle>
                          <Badge className={`mt-2 text-xs ${categoryLabels[partner.category].className}`}>
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {categoryLabels[partner.category].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {partner.fullDescription}
                    </p>

                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Key Capabilities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {partner.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Case Study */}
                    {partner.caseStudy && (
                      <div className="bg-muted/30 rounded-lg p-4 mt-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          {partner.caseStudy.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {partner.caseStudy.description}
                        </p>
                        {partner.caseStudy.metrics && (
                          <div className="flex flex-wrap gap-3">
                            {partner.caseStudy.metrics.map((metric, idx) => (
                              <div key={idx} className="text-center">
                                <div className="text-lg font-bold text-primary">{metric.value}</div>
                                <div className="text-xs text-muted-foreground">{metric.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Why Partner With Us */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Partner With CarbonConstruct?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join Australia's leading carbon compliance platform and help shape the future of sustainable construction.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="glass" className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Growing User Base</h3>
              <p className="text-sm text-muted-foreground">
                Access a rapidly growing community of builders, developers, and sustainability professionals across Australia.
              </p>
            </Card>
            <Card variant="glass" className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Industry Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Showcase your products and services to decision-makers actively seeking sustainable construction solutions.
              </p>
            </Card>
            <Card variant="glass" className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Data Integration</h3>
              <p className="text-sm text-muted-foreground">
                Integrate your EPDs and product data directly into our platform, enabling accurate carbon calculations.
              </p>
            </Card>
          </div>
        </section>

        {/* Partnership Inquiry Form */}
        <section id="inquiry" className="max-w-3xl mx-auto">
          <Card variant="glass" className="glass-glow-hover">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Handshake className="h-6 w-6 text-primary" />
                Become a Partner
              </CardTitle>
              <CardDescription>
                Interested in partnering with CarbonConstruct? Fill out the form below and our partnerships team will be in touch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Inquiry Submitted Successfully!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for your interest in partnering with CarbonConstruct. 
                    Our team will review your inquiry and get back to you within 2-3 business days.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your company name"
                        disabled={isSubmitting}
                        aria-describedby={errors.companyName ? "companyName-error" : undefined}
                        className={errors.companyName ? "border-destructive" : ""}
                      />
                      {errors.companyName && (
                        <p id="companyName-error" className="text-sm text-destructive">{errors.companyName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        disabled={isSubmitting}
                        aria-describedby={errors.contactName ? "contactName-error" : undefined}
                        className={errors.contactName ? "border-destructive" : ""}
                      />
                      {errors.contactName && (
                        <p id="contactName-error" className="text-sm text-destructive">{errors.contactName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@company.com"
                        disabled={isSubmitting}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourcompany.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partnershipType">Partnership Type *</Label>
                    <select
                      id="partnershipType"
                      name="partnershipType"
                      value={formData.partnershipType}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.partnershipType ? "border-destructive" : "border-input"}`}
                      aria-describedby={errors.partnershipType ? "partnershipType-error" : undefined}
                    >
                      <option value="">Select partnership type...</option>
                      <option value="data-provider">Data Provider (EPDs, Emission Factors)</option>
                      <option value="manufacturer">Manufacturer (Product Integration)</option>
                      <option value="industry">Industry Partner (Construction, Architecture)</option>
                      <option value="technology">Technology Partner (Software Integration)</option>
                      <option value="certification">Certification Body</option>
                      <option value="reseller">Reseller / Channel Partner</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.partnershipType && (
                      <p id="partnershipType-error" className="text-sm text-destructive">{errors.partnershipType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Tell us about your partnership idea *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your company, what you offer, and how you'd like to partner with CarbonConstruct..."
                      rows={5}
                      disabled={isSubmitting}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-sm text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Partnership Inquiry
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Have questions about partnerships? Reach out directly.
          </p>
          <Button variant="outline" onClick={() => navigate("/contact")}>
            Contact Us
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </main>
    </>
  );
};

export default Partners;
