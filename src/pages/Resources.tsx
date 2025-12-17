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
  ExternalLink,
  Video,
  Clock
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

        {/* Social Media Graphics Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4">Share the Research</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                LinkedIn Graphics
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Download these infographics to share on LinkedIn and educate your network about carbon reporting requirements
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted">
                    <img 
                      src="/social/linkedin-silent-transfer-stats.png" 
                      alt="The Silent Transfer - Key Statistics"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Key Statistics</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      80-90% Scope 3, $123/t shadow price, 20-30% penalties
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href="/social/linkedin-silent-transfer-stats.png" download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted">
                    <img 
                      src="/social/linkedin-data-hierarchy.png" 
                      alt="Data Quality Hierarchy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Data Quality Hierarchy</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      EPD vs generic data penalties in Green Star ratings
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href="/social/linkedin-data-hierarchy.png" download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted">
                    <img 
                      src="/social/linkedin-procurement-firewall.png" 
                      alt="The Procurement Firewall"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Procurement Firewall</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      ASRS rollout timeline and tender exclusion risk
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href="/social/linkedin-procurement-firewall.png" download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* LinkedIn Post Templates */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4">Ready to Post</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                LinkedIn Post Templates
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Copy these ready-to-use captions and pair with the graphics above for maximum impact
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Post Template 1 - The Hook */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-2">
                  <Badge className="w-fit mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    High Engagement Hook
                  </Badge>
                  <CardTitle className="text-lg">The Silent Transfer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
{`🚨 Your subcontractors can't provide EPD data.

But your Scope 3 report is due in 6 months.

Here's what happens next:

→ You apply "conservative defaults" (industry averages)
→ Your materials look 20-30% dirtier than reality
→ Your Green Star rating drops
→ Your government tender fails

The legislation doesn't name subcontractors.
It doesn't need to.

The burden flows through procurement.
And procurement is YOUR problem.

📄 Read the full analysis: "The Silent Transfer"
Link in comments 👇

#Construction #Sustainability #CarbonReporting #ASRS #GreenStar`}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(`🚨 Your subcontractors can't provide EPD data.

But your Scope 3 report is due in 6 months.

Here's what happens next:

→ You apply "conservative defaults" (industry averages)
→ Your materials look 20-30% dirtier than reality
→ Your Green Star rating drops
→ Your government tender fails

The legislation doesn't name subcontractors.
It doesn't need to.

The burden flows through procurement.
And procurement is YOUR problem.

📄 Read the full analysis: "The Silent Transfer"
Link in comments 👇

#Construction #Sustainability #CarbonReporting #ASRS #GreenStar`);
                      toast({
                        title: "Copied to clipboard!",
                        description: "Paste into your LinkedIn post.",
                      });
                    }}
                  >
                    Copy Caption
                  </Button>
                </CardContent>
              </Card>

              {/* Post Template 2 - The Stats */}
              <Card className="border-2 border-amber-500/20">
                <CardHeader className="pb-2">
                  <Badge className="w-fit mb-2 bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Pair with Stats Graphic
                  </Badge>
                  <CardTitle className="text-lg">The Numbers Don't Lie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
{`80-90% of a builder's carbon footprint is Scope 3.

That's YOUR materials. YOUR supply chain.

And here's what's coming:

📊 $123/tonne shadow carbon price (NSW & VIC)
📉 20-30% penalty for missing EPD data
🚫 Tender exclusion without carbon credentials

The ASRS mandate isn't targeting subcontractors directly.

But when Tier 1 builders can't report Scope 3...
...they exclude suppliers who can't provide data.

It's not personal. It's procurement.

Are you ready for The Silent Transfer?

#ConstructionIndustry #Sustainability #NetZero #CarbonFootprint #Australia`}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(`80-90% of a builder's carbon footprint is Scope 3.

That's YOUR materials. YOUR supply chain.

And here's what's coming:

📊 $123/tonne shadow carbon price (NSW & VIC)
📉 20-30% penalty for missing EPD data
🚫 Tender exclusion without carbon credentials

The ASRS mandate isn't targeting subcontractors directly.

But when Tier 1 builders can't report Scope 3...
...they exclude suppliers who can't provide data.

It's not personal. It's procurement.

Are you ready for The Silent Transfer?

#ConstructionIndustry #Sustainability #NetZero #CarbonFootprint #Australia`);
                      toast({
                        title: "Copied to clipboard!",
                        description: "Paste into your LinkedIn post.",
                      });
                    }}
                  >
                    Copy Caption
                  </Button>
                </CardContent>
              </Card>

              {/* Post Template 3 - The Question */}
              <Card className="border-2 border-blue-500/20">
                <CardHeader className="pb-2">
                  <Badge className="w-fit mb-2 bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Engagement Driver
                  </Badge>
                  <CardTitle className="text-lg">The Uncomfortable Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
{`Question for construction subcontractors:

When was the last time a Tier 1 builder asked you for EPD data?

If the answer is "never"—enjoy the next 12 months.

If the answer is "recently"—you already know what's coming.

The Procurement Firewall is real:
✗ No EPD? No shortlist.
✗ No carbon data? Higher risk rating.
✗ No compliance? Contract breach.

This isn't about sustainability values.
This is about ASRS compliance.
And compliance is non-negotiable.

The question isn't IF this affects you.
It's WHEN.

What's your plan?

#BuildingIndustry #Compliance #SupplyChain #RiskManagement #Procurement`}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(`Question for construction subcontractors:

When was the last time a Tier 1 builder asked you for EPD data?

If the answer is "never"—enjoy the next 12 months.

If the answer is "recently"—you already know what's coming.

The Procurement Firewall is real:
✗ No EPD? No shortlist.
✗ No carbon data? Higher risk rating.
✗ No compliance? Contract breach.

This isn't about sustainability values.
This is about ASRS compliance.
And compliance is non-negotiable.

The question isn't IF this affects you.
It's WHEN.

What's your plan?

#BuildingIndustry #Compliance #SupplyChain #RiskManagement #Procurement`);
                      toast({
                        title: "Copied to clipboard!",
                        description: "Paste into your LinkedIn post.",
                      });
                    }}
                  >
                    Copy Caption
                  </Button>
                </CardContent>
              </Card>

              {/* Post Template 4 - The Controversy */}
              <Card className="border-2 border-red-500/20">
                <CardHeader className="pb-2">
                  <Badge className="w-fit mb-2 bg-red-500/10 text-red-600 border-red-500/20">
                    Controversial Take
                  </Badge>
                  <CardTitle className="text-lg">The Uncomfortable Truth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
{`Hot take: Procurement software won't save your carbon compliance.

Here's why:

Your procurement platform can track:
✓ Prices
✓ Delivery times
✓ Supplier ratings

But can it tell you:
→ kgCO2e per m² of your facade?
→ EN 15804 lifecycle factors for each material?
→ Which supplier has verified EPD data?

Didn't think so.

The carbon liability that used to sit with Tier 1 builders is now flowing downstream.

And your procurement tools weren't built for this.

Time to ask your software vendor some uncomfortable questions.

Or find tools that were built for the carbon compliance era.

#Procurement #ConstructionTech #CarbonCompliance #SupplyChainManagement`}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(`Hot take: Procurement software won't save your carbon compliance.

Here's why:

Your procurement platform can track:
✓ Prices
✓ Delivery times
✓ Supplier ratings

But can it tell you:
→ kgCO2e per m² of your facade?
→ EN 15804 lifecycle factors for each material?
→ Which supplier has verified EPD data?

Didn't think so.

The carbon liability that used to sit with Tier 1 builders is now flowing downstream.

And your procurement tools weren't built for this.

Time to ask your software vendor some uncomfortable questions.

Or find tools that were built for the carbon compliance era.

#Procurement #ConstructionTech #CarbonCompliance #SupplyChainManagement`);
                      toast({
                        title: "Copied to clipboard!",
                        description: "Paste into your LinkedIn post.",
                      });
                    }}
                  >
                    Copy Caption
                  </Button>
                </CardContent>
              </Card>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <p className="text-sm text-muted-foreground">
                💡 Tip: Post with the matching graphic for 3x higher engagement. Add the whitepaper link in your first comment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Video Script Template */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-600">
                <Video className="w-3 h-3 mr-1" />
                Video Content
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                60-Second LinkedIn Video Script
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Record this script to explain The Silent Transfer concept—high engagement format for LinkedIn
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">The Silent Transfer</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />
                          60 seconds • LinkedIn Video
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      High Performance Format
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Script with timing markers */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="text-xs text-purple-600 font-semibold mb-1">0:00 - 0:10 | THE HOOK</p>
                      <p className="text-foreground">
                        "If you're a subcontractor in construction, there's something happening right now that could lock you out of tenders—and it has nothing to do with your price or your quality."
                      </p>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <p className="text-xs text-amber-600 font-semibold mb-1">0:10 - 0:25 | THE PROBLEM</p>
                      <p className="text-foreground">
                        "It's called The Silent Transfer. Here's how it works: The ASRS mandate forces Tier 1 builders to report their Scope 3 emissions—that's 80 to 90 percent of their carbon footprint. And guess where that carbon comes from? Your materials. Your supply chain."
                      </p>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4 py-2">
                      <p className="text-xs text-red-600 font-semibold mb-1">0:25 - 0:40 | THE CONSEQUENCE</p>
                      <p className="text-foreground">
                        "When you can't provide EPD data, rating tools apply 'conservative defaults'—inflated values that make your materials look 20 to 30 percent dirtier than they actually are. Your client loses Green Star points. Their government tender fails. And next time? They don't call you."
                      </p>
                    </div>

                    <div className="border-l-4 border-emerald-500 pl-4 py-2">
                      <p className="text-xs text-emerald-600 font-semibold mb-1">0:40 - 0:55 | THE INSIGHT</p>
                      <p className="text-foreground">
                        "The legislation doesn't name subcontractors. It doesn't need to. The burden flows through procurement. And procurement is becoming a firewall—as formidable as financial insolvency or safety non-compliance."
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-xs text-primary font-semibold mb-1">0:55 - 1:00 | THE CTA</p>
                      <p className="text-foreground">
                        "The question isn't IF this affects you. It's WHEN. Link in comments to the full analysis."
                      </p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-muted/50 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Recording Tips
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>Selfie format:</strong> Face camera, good lighting, construction site or office background</li>
                      <li>• <strong>Energy:</strong> Start intense (the hook), stay conversational but urgent</li>
                      <li>• <strong>Captions:</strong> Always add captions—80% watch muted</li>
                      <li>• <strong>Post time:</strong> Tuesday-Thursday, 8-9am or 5-6pm local time</li>
                    </ul>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(`60-SECOND LINKEDIN VIDEO SCRIPT: "The Silent Transfer"

[0:00-0:10] THE HOOK
"If you're a subcontractor in construction, there's something happening right now that could lock you out of tenders—and it has nothing to do with your price or your quality."

[0:10-0:25] THE PROBLEM
"It's called The Silent Transfer. Here's how it works: The ASRS mandate forces Tier 1 builders to report their Scope 3 emissions—that's 80 to 90 percent of their carbon footprint. And guess where that carbon comes from? Your materials. Your supply chain."

[0:25-0:40] THE CONSEQUENCE
"When you can't provide EPD data, rating tools apply 'conservative defaults'—inflated values that make your materials look 20 to 30 percent dirtier than they actually are. Your client loses Green Star points. Their government tender fails. And next time? They don't call you."

[0:40-0:55] THE INSIGHT
"The legislation doesn't name subcontractors. It doesn't need to. The burden flows through procurement. And procurement is becoming a firewall—as formidable as financial insolvency or safety non-compliance."

[0:55-1:00] THE CTA
"The question isn't IF this affects you. It's WHEN. Link in comments to the full analysis."`);
                      toast({
                        title: "Script copied!",
                        description: "Full script with timing markers copied to clipboard.",
                      });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Copy Full Script
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* LinkedIn Carousel Template */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-600">
                <FileText className="w-3 h-3 mr-1" />
                Carousel Content
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                LinkedIn Carousel Template
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                10-slide carousel content for The Silent Transfer—copy text for each slide and create in Canva or your design tool
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Slide 1 - Cover */}
                <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-amber-500/5 to-red-500/5">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 1 • Cover</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center text-center mb-3">
                      <p className="text-2xl font-bold text-foreground mb-2">THE SILENT TRANSFER</p>
                      <p className="text-sm text-muted-foreground">How Scope 3 Mandates Are Locking Subcontractors Out of Tenders</p>
                      <p className="text-xs text-amber-600 mt-4">Swipe to learn →</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("THE SILENT TRANSFER\n\nHow Scope 3 Mandates Are Locking Subcontractors Out of Tenders\n\nSwipe to learn →");
                        toast({ title: "Slide 1 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 2 - The Stat */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 2 • Hook Stat</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center text-center mb-3">
                      <p className="text-4xl font-bold text-amber-600 mb-2">80-90%</p>
                      <p className="text-sm text-foreground">of a builder's carbon footprint is Scope 3</p>
                      <p className="text-xs text-muted-foreground mt-3">That's YOUR materials. YOUR supply chain.</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("80-90%\n\nof a builder's carbon footprint is Scope 3\n\nThat's YOUR materials. YOUR supply chain.");
                        toast({ title: "Slide 2 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 3 - The Problem */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 3 • Problem</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center mb-3">
                      <p className="text-lg font-bold text-foreground mb-3">ASRS mandates force builders to report Scope 3</p>
                      <p className="text-sm text-muted-foreground">They can't report what they can't measure.</p>
                      <p className="text-sm text-muted-foreground mt-2">So they need YOUR data.</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("ASRS mandates force builders to report Scope 3\n\nThey can't report what they can't measure.\n\nSo they need YOUR data.");
                        toast({ title: "Slide 3 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 4 - Conservative Defaults */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 4 • Penalty</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center text-center mb-3">
                      <p className="text-sm text-foreground mb-2">No EPD data?</p>
                      <p className="text-3xl font-bold text-red-600 mb-2">20-30%</p>
                      <p className="text-sm text-foreground">penalty applied</p>
                      <p className="text-xs text-muted-foreground mt-3">"Conservative defaults" make your materials look dirtier than reality</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("No EPD data?\n\n20-30% penalty applied\n\n\"Conservative defaults\" make your materials look dirtier than reality");
                        toast({ title: "Slide 4 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 5 - Shadow Price */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 5 • Shadow Price</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center text-center mb-3">
                      <p className="text-sm text-foreground mb-2">NSW & VIC apply</p>
                      <p className="text-3xl font-bold text-amber-600 mb-2">$123/tonne</p>
                      <p className="text-sm text-foreground">shadow carbon price</p>
                      <p className="text-xs text-muted-foreground mt-3">Low-carbon suppliers win tenders even at higher prices</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("NSW & VIC apply\n\n$123/tonne shadow carbon price\n\nLow-carbon suppliers win tenders even at higher prices");
                        toast({ title: "Slide 5 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 6 - The Cascade */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 6 • Cascade</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center mb-3">
                      <p className="text-sm font-bold text-foreground mb-3">The Cascade Effect:</p>
                      <ul className="text-xs text-muted-foreground space-y-2 text-left">
                        <li>→ Missing EPD data</li>
                        <li>→ Inflated carbon score</li>
                        <li>→ Client loses Green Star points</li>
                        <li>→ Government tender fails</li>
                        <li>→ <span className="text-red-600 font-semibold">You lose the next call</span></li>
                      </ul>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("The Cascade Effect:\n\n→ Missing EPD data\n→ Inflated carbon score\n→ Client loses Green Star points\n→ Government tender fails\n→ You lose the next call");
                        toast({ title: "Slide 6 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 7 - The Firewall */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 7 • Firewall</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center text-center mb-3">
                      <p className="text-lg font-bold text-foreground mb-3">THE PROCUREMENT FIREWALL</p>
                      <p className="text-sm text-muted-foreground">As formidable as:</p>
                      <ul className="text-sm text-foreground mt-2 space-y-1">
                        <li>❌ Financial insolvency</li>
                        <li>❌ Safety non-compliance</li>
                        <li>❌ Missing insurance</li>
                      </ul>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("THE PROCUREMENT FIREWALL\n\nAs formidable as:\n❌ Financial insolvency\n❌ Safety non-compliance\n❌ Missing insurance");
                        toast({ title: "Slide 7 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 8 - The Truth */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 8 • Truth</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center text-center mb-3">
                      <p className="text-lg font-bold text-foreground mb-3">The legislation doesn't name subcontractors.</p>
                      <p className="text-2xl font-bold text-amber-600">It doesn't need to.</p>
                      <p className="text-sm text-muted-foreground mt-3">The burden flows through procurement.</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("The legislation doesn't name subcontractors.\n\nIt doesn't need to.\n\nThe burden flows through procurement.");
                        toast({ title: "Slide 8 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 9 - Timeline */}
                <Card className="border-2 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 9 • Timeline</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center mb-3">
                      <p className="text-sm font-bold text-foreground mb-3 text-center">TIMELINE</p>
                      <ul className="text-xs space-y-2">
                        <li><span className="font-semibold text-emerald-600">2024:</span> ASRS mandatory</li>
                        <li><span className="font-semibold text-amber-600">2025:</span> Threshold drops</li>
                        <li><span className="font-semibold text-orange-600">2026:</span> Universal standard</li>
                        <li><span className="font-semibold text-red-600">2027+:</span> Full enforcement</li>
                      </ul>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("TIMELINE\n\n2024: ASRS mandatory\n2025: Threshold drops\n2026: Universal standard\n2027+: Full enforcement");
                        toast({ title: "Slide 9 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>

                {/* Slide 10 - CTA */}
                <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-emerald-500/5 to-primary/5">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit text-xs">Slide 10 • CTA</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg p-4 flex flex-col justify-center text-center mb-3">
                      <p className="text-lg font-bold text-foreground mb-3">The question isn't IF this affects you.</p>
                      <p className="text-2xl font-bold text-primary mb-3">It's WHEN.</p>
                      <p className="text-sm text-muted-foreground">📄 Full analysis in comments</p>
                      <p className="text-xs text-emerald-600 mt-2">carbonconstruct.com.au/resources</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText("The question isn't IF this affects you.\n\nIt's WHEN.\n\n📄 Full analysis in comments\ncarbonconstruct.com.au/resources");
                        toast({ title: "Slide 10 copied!" });
                      }}
                    >
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Copy all button */}
              <div className="mt-8 text-center">
                <Button 
                  size="lg"
                  onClick={() => {
                    const allSlides = `LINKEDIN CAROUSEL: "The Silent Transfer" (10 Slides)

SLIDE 1 (COVER):
THE SILENT TRANSFER
How Scope 3 Mandates Are Locking Subcontractors Out of Tenders
Swipe to learn →

SLIDE 2 (HOOK STAT):
80-90%
of a builder's carbon footprint is Scope 3
That's YOUR materials. YOUR supply chain.

SLIDE 3 (PROBLEM):
ASRS mandates force builders to report Scope 3
They can't report what they can't measure.
So they need YOUR data.

SLIDE 4 (PENALTY):
No EPD data?
20-30% penalty applied
"Conservative defaults" make your materials look dirtier than reality

SLIDE 5 (SHADOW PRICE):
NSW & VIC apply
$123/tonne shadow carbon price
Low-carbon suppliers win tenders even at higher prices

SLIDE 6 (CASCADE):
The Cascade Effect:
→ Missing EPD data
→ Inflated carbon score
→ Client loses Green Star points
→ Government tender fails
→ You lose the next call

SLIDE 7 (FIREWALL):
THE PROCUREMENT FIREWALL
As formidable as:
❌ Financial insolvency
❌ Safety non-compliance
❌ Missing insurance

SLIDE 8 (TRUTH):
The legislation doesn't name subcontractors.
It doesn't need to.
The burden flows through procurement.

SLIDE 9 (TIMELINE):
2024: ASRS mandatory
2025: Threshold drops
2026: Universal standard
2027+: Full enforcement

SLIDE 10 (CTA):
The question isn't IF this affects you.
It's WHEN.
📄 Full analysis in comments
carbonconstruct.com.au/resources

---
POST CAPTION:
The ASRS mandate doesn't name subcontractors. It doesn't need to.

Here's how carbon compliance is becoming a procurement firewall that could lock you out of tenders—even when your prices are competitive.

📄 Full whitepaper link in comments

#Construction #Sustainability #Subcontractors #CarbonCompliance #ASRS`;
                    navigator.clipboard.writeText(allSlides);
                    toast({ title: "All slides + caption copied!", description: "Ready to create in Canva" });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Copy All Slides + Caption
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  💡 Tip: Create 1080x1080px slides in Canva. Use bold typography and high contrast colors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-16 md:py-24">
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
