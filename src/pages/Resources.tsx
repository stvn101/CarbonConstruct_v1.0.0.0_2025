import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen,
  Shield,
  TrendingUp,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";

const Resources = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address to download the whitepaper.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the lead capture
      await supabase.from("analytics_events").insert({
        event_name: "whitepaper_download",
        event_data: { 
          email: email,
          whitepaper: "the-silent-transfer",
          source: window.location.pathname 
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

      setHasDownloaded(true);
      toast({
        title: "Download started!",
        description: "Check your downloads folder for the whitepaper.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const keyInsights = [
    {
      icon: AlertTriangle,
      title: "The Procurement Firewall",
      description: "Subcontractors without EPDs face exclusion from tenders—not due to price, but data poverty."
    },
    {
      icon: TrendingUp,
      title: "Shadow Carbon Pricing",
      description: "NSW & VIC apply $123/tonne shadow prices, making 'low carbon' suppliers win even at higher prices."
    },
    {
      icon: Shield,
      title: "Conservative Default Penalties",
      description: "Missing EPDs force 20-30% inflated carbon scores, killing your client's Green Star rating."
    },
    {
      icon: FileText,
      title: "Contract Mandates",
      description: "ASRS Scope 3 requirements cascade into contractual obligations—non-compliance is breach of contract."
    }
  ];

  return (
    <>
      <SEOHead
        title="Resources & Research | CarbonConstruct"
        description="Industry research and whitepapers on carbon reporting requirements for Australian construction subcontractors. Download 'The Silent Transfer' whitepaper."
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                <BookOpen className="w-3 h-3 mr-1" />
                Industry Research
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Resources & Research
              </h1>
              <p className="text-lg text-muted-foreground">
                Understand the regulatory forces reshaping Australian construction procurement. 
                Our research helps you stay ahead of mandatory carbon reporting requirements.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Whitepaper */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Whitepaper Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Featured Whitepaper
                </Badge>
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                  The Silent Transfer
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  How Scope 3 Mandates and Procurement Leverage Are Shifting Carbon Liability 
                  to the Construction Supply Chain
                </p>
                <p className="text-muted-foreground mb-8">
                  A comprehensive 14-page analysis of why subcontractors who can't provide EPD data 
                  face exclusion from tenders—even when their prices are competitive. Covers ASRS requirements, 
                  Green Star penalties, shadow carbon pricing, and contractual enforcement mechanisms.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Badge variant="secondary">14 Pages</Badge>
                  <Badge variant="secondary">ASRS Analysis</Badge>
                  <Badge variant="secondary">Green Star</Badge>
                  <Badge variant="secondary">IS Ratings</Badge>
                  <Badge variant="secondary">NABERS</Badge>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  By Steven Jenkins, Director of United Facade Pty Ltd & Founder of CarbonConstruct
                </p>
              </motion.div>

              {/* Download Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="border-2 border-primary/20 shadow-xl">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">
                      {hasDownloaded ? "Download Complete!" : "Download Free Whitepaper"}
                    </CardTitle>
                    <CardDescription>
                      {hasDownloaded 
                        ? "Thank you for your interest. Check your downloads folder."
                        : "Enter your email to receive the full whitepaper PDF"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasDownloaded ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-muted-foreground">
                          Want to put these insights into action?
                        </p>
                        <Button asChild className="w-full">
                          <Link to="/auth">
                            Start Free Carbon Calculator
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = "/resources/the-silent-transfer-whitepaper.pdf";
                            link.download = "The_Silent_Transfer_CarbonConstruct.pdf";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Again
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleDownload} className="space-y-4">
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
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            "Processing..."
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          We respect your privacy. No spam, ever.
                        </p>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Insights Preview */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Key Insights from the Research
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A preview of the critical findings every subcontractor needs to understand
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                        <insight.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Executive Summary Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Executive Summary</Badge>
                  <CardTitle className="text-2xl">The Bottom Line</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    The ASRS regime forces Tier 1 builders to report Scope 3 emissions—which are 
                    <strong className="text-foreground"> 80-90% of their total footprint</strong>. 
                    This creates a cascade effect: builders can't report what they can't measure, 
                    so they contractually mandate data from subcontractors.
                  </p>
                  
                  <div className="my-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-700 dark:text-amber-400 font-medium mb-2">
                      The Critical Insight:
                    </p>
                    <p className="text-muted-foreground">
                      When you don't provide EPD data, rating tools apply "conservative defaults"—
                      inflated values that make your materials look 20-30% dirtier than reality. 
                      Your client loses Green Star points, and you lose the next tender.
                    </p>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    The legislation doesn't name subcontractors because it doesn't need to. 
                    The burden flows through procurement: builders who can't demonstrate low-carbon 
                    supply chains lose government contracts. They respond by excluding suppliers 
                    without EPDs—creating a <strong className="text-foreground">"procurement firewall"</strong> as 
                    formidable as financial insolvency or safety non-compliance.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button asChild>
                      <Link to="/auth">
                        Get Your Carbon Data Ready
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a 
                        href="/resources/the-silent-transfer-whitepaper.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read Full Whitepaper
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                External Resources
              </h2>
              <p className="text-muted-foreground">
                Official sources referenced in our research
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">NCC 2024</CardTitle>
                  <CardDescription>National Construction Code</CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="https://ncc.abcb.gov.au/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    Visit ABCB <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Green Star</CardTitle>
                  <CardDescription>GBCA Rating System</CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="https://www.gbca.org.au/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    Visit GBCA <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">ASRS Standards</CardTitle>
                  <CardDescription>Treasury Laws Amendment</CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="https://treasury.gov.au/consultation/c2024-466491" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    Visit Treasury <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Resources;
