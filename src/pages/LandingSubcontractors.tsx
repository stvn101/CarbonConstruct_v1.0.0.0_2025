import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Shield, 
  TrendingDown, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Truck,
  HardHat,
  Factory,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  X,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { WhitepaperSummary } from "@/components/WhitepaperSummary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LandingSubcontractors = () => {
  const { toast } = useToast();
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Show popup after 15 seconds or 50% scroll
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("subcontractor_popup_seen");
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
      sessionStorage.setItem("subcontractor_popup_seen", "true");
    }, 15000);

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !showPopup) {
        setShowPopup(true);
        sessionStorage.setItem("subcontractor_popup_seen", "true");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showPopup]);

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await supabase.from("analytics_events").insert({
        event_name: "whitepaper_popup_download",
        event_data: { 
          email,
          source: "subcontractor_landing_popup",
          whitepaper: "the-silent-transfer"
        },
        page_url: window.location.href,
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = "/resources/the-silent-transfer-whitepaper.pdf";
      link.download = "The_Silent_Transfer_CarbonConstruct.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setHasSubmitted(true);
      toast({
        title: "Download started!",
        description: "Check your downloads folder.",
      });
    } catch (error) {
      console.error("Popup submit error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const warningSignals = [
    {
      icon: FileText,
      title: "EPD Data Requests",
      description: "Tier 1 builders are asking for Environmental Product Declarations you don't have."
    },
    {
      icon: DollarSign,
      title: "Losing Tenders",
      description: "Your competitive quotes are being rejected for 'compliance reasons'."
    },
    {
      icon: Clock,
      title: "New Contract Clauses",
      description: "Contracts now include carbon reporting obligations you can't meet."
    },
    {
      icon: TrendingDown,
      title: "Higher Risk Rating",
      description: "Your prequalification scores are dropping despite good safety and quality records."
    }
  ];

  const silentTransferTimeline = [
    {
      date: "2024",
      title: "ASRS Mandatory",
      description: "Large entities must report Scope 3 emissions—80-90% of construction carbon."
    },
    {
      date: "2025",
      title: "Threshold Drops",
      description: "More builders captured. Compliance pressure intensifies down supply chain."
    },
    {
      date: "2026",
      title: "Universal Standard",
      description: "Carbon data becomes standard procurement requirement. No EPD = no shortlist."
    },
    {
      date: "2027+",
      title: "Full Enforcement",
      description: "Contract breaches for non-compliance. Insurance implications emerge."
    }
  ];

  const subcontractorTypes = [
    { icon: HardHat, title: "Trades", examples: "Carpentry, Electrical, Plumbing, HVAC" },
    { icon: Factory, title: "Manufacturers", examples: "Steel, Concrete, Glass, Timber" },
    { icon: Truck, title: "Suppliers", examples: "Aggregates, Fixtures, Hardware" },
    { icon: Building2, title: "Specialists", examples: "Facades, Roofing, Fitout" }
  ];

  return (
    <>
      <SEOHead
        title="Subcontractors: The Silent Transfer of Carbon Liability | CarbonConstruct"
        description="Why subcontractors without EPD data face tender exclusion. Understand the ASRS Scope 3 mandate and prepare your business before the procurement firewall shuts you out."
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section - Urgent Warning */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-amber-500/10 via-background to-red-500/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.05),transparent_70%)]" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600 bg-amber-500/10">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Critical Industry Shift
              </Badge>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                The Legislation Doesn't Name You.
                <span className="block text-amber-600 mt-2">It Doesn't Need To.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                ASRS Scope 3 mandates are creating a <strong className="text-foreground">procurement firewall</strong> that 
                will exclude subcontractors who can't provide carbon data—regardless of price or quality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link to="/auth">
                    Prepare Your Business Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/resources">
                    <Download className="w-5 h-5 mr-2" />
                    Read "The Silent Transfer"
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Free whitepaper: 14-page analysis of why carbon compliance is your problem now
              </p>
            </motion.div>
          </div>
        </section>

        {/* The Problem Explained */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                  What Is "The Silent Transfer"?
                </h2>
                <p className="text-lg text-muted-foreground">
                  A mechanism that shifts carbon liability from Tier 1 builders to their supply chain—without changing any laws
                </p>
              </div>

              <Card className="border-2 border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-8">
                  <div className="space-y-6 text-lg">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Step 1:</strong> ASRS mandates force large entities to report 
                      Scope 3 emissions—<span className="text-amber-600 font-semibold">80-90% of construction carbon</span>.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Step 2:</strong> Builders can't report what they can't measure. 
                      They need EPD data from their supply chain.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Step 3:</strong> Missing EPD data forces "conservative defaults"—
                      <span className="text-red-600 font-semibold">20-30% inflated carbon scores</span>.
                    </p>
                    
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Step 4:</strong> Inflated scores kill Green Star ratings, 
                      fail government tenders, breach contracts.
                    </p>
                    
                    <div className="pt-4 border-t border-amber-500/30">
                      <p className="text-foreground font-semibold text-xl">
                        Result: Subcontractors without EPD data become procurement liabilities—
                        excluded from tenders even when their prices are competitive.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Warning Signs */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4 border-red-500/30 text-red-600">
                Warning Signs
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Are You Already Feeling the Pressure?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                If any of these sound familiar, the silent transfer is already affecting your business
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {warningSignals.map((signal, index) => (
                <motion.div
                  key={signal.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-red-500/20 hover:border-red-500/40 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-3">
                        <signal.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <CardTitle className="text-lg">{signal.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{signal.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who's Affected */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Every Subcontractor Is Affected
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                If you supply materials, labour, or services to Tier 1 builders, you're in the supply chain they must report
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {subcontractorTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <type.icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{type.examples}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4">Timeline</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                The Procurement Firewall Is Coming
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each year, more builders are captured by ASRS mandates—and their compliance pressure flows to you
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-red-500" />
                
                {silentTransferTimeline.map((item, index) => (
                  <motion.div
                    key={item.date}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className={`relative flex items-center mb-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"} pl-20 md:pl-0`}>
                      <Card className="inline-block">
                        <CardHeader className="pb-2">
                          <Badge className="w-fit mb-2" variant={index === 0 ? "default" : "secondary"}>
                            {item.date}
                          </Badge>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-background border-4 border-primary transform md:-translate-x-1/2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Whitepaper Summary */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <WhitepaperSummary />
          </div>
        </section>

        {/* Solution */}
        <section className="py-16 md:py-24 bg-emerald-500/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Shield className="w-3 h-3 mr-1" />
                Your Solution
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
                Get Ahead of the Procurement Firewall
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                CarbonConstruct gives you the carbon credentials Tier 1 builders need—before they stop calling you
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="border-emerald-500/20">
                  <CardHeader>
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <CardTitle className="text-lg">Calculate Your Footprint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Material-by-material carbon calculations using 4,000+ verified Australian EPDs
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-500/20">
                  <CardHeader>
                    <FileText className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <CardTitle className="text-lg">Generate Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      EN 15978 compliant reports that satisfy Green Star, NABERS, and IS Rating requirements
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-500/20">
                  <CardHeader>
                    <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <CardTitle className="text-lg">Stay Competitive</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Provide the EPD data builders need—keep your spot on tender shortlists
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/auth">
                    Start Free—No Credit Card
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/resources/the-silent-transfer-whitepaper.pdf" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Download Full Whitepaper
                  </a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                Built by a 17-year construction industry veteran who understands subcontractor realities
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />

        {/* Email Capture Popup */}
        <AnimatePresence>
          {showPopup && !hasSubmitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-background border-2 border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Close button */}
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Warning header */}
                <div className="bg-gradient-to-r from-amber-500/20 to-red-500/20 px-6 py-4 border-b border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Industry Alert</p>
                      <h3 className="text-lg font-bold text-foreground">The Silent Transfer Is Coming</h3>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Don't get locked out of tenders. Download our free 14-page analysis on why 
                    <strong className="text-foreground"> subcontractors without EPD data face exclusion</strong>—even 
                    when their prices are competitive.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">ASRS Scope 3 mandate analysis</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">$123/t shadow carbon pricing impact</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Green Star penalty breakdown</span>
                    </div>
                  </div>

                  <form onSubmit={handlePopupSubmit} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Free Whitepaper
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No spam. Unsubscribe anytime.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default LandingSubcontractors;
