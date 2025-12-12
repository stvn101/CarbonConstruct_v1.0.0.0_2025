import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { 
  Calculator, 
  Upload, 
  FileSpreadsheet, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Play,
  Pause
} from "lucide-react";

const steps = [
  {
    icon: FileSpreadsheet,
    title: "1. Upload Your BOQ",
    description: "Simply upload your Bill of Quantities in any common format - Excel, CSV, or PDF. Our AI understands construction documents.",
    highlight: "Supports Excel, CSV, PDF"
  },
  {
    icon: Zap,
    title: "2. AI Processes Materials",
    description: "Our AI automatically identifies materials, quantities, and units from your document. No manual data entry required.",
    highlight: "52+ materials in seconds"
  },
  {
    icon: CheckCircle2,
    title: "3. Review & Calculate",
    description: "Review the extracted materials, make any adjustments, and instantly calculate your project's carbon footprint.",
    highlight: "Accurate EPD-backed factors"
  }
];

const comparisons = [
  { competitor: "Traditional Methods", time: "2-3 hours", icon: "📋" },
  { competitor: "OneClickLCA", time: "90 minutes", icon: "🔢" },
  { competitor: "eTool", time: "60 minutes", icon: "⏱️" },
  { competitor: "CarbonConstruct", time: "15 seconds", icon: "⚡", highlight: true }
];

const Demo = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Lazy load video when visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video && isVisible) {
      video.playbackRate = 2.0;
    }
  }, [isVisible]);

  return (
    <>
      <SEOHead
        title="AI BOQ Import Demo | CarbonConstruct"
        description="See how CarbonConstruct's AI-powered BOQ import transforms 90 minutes of manual data entry into 15 seconds of automation."
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Upload className="h-4 w-4" />
                AI-Powered BOQ Import
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="text-muted-foreground line-through decoration-2">90 Minutes</span>
                <span className="mx-3 text-primary">→</span>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">15 Seconds</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Watch how CarbonConstruct's AI transforms your Bill of Quantities into a complete carbon calculation in seconds, not hours.
              </p>
            </div>

            {/* Video Container */}
            <div ref={containerRef} className="relative max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-card">
              {isVisible ? (
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                  poster="/hero-carbon-calc.webp"
                >
                  <source src="/demo/boq-import-teaser.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full aspect-video bg-muted flex items-center justify-center">
                  <img src="/hero-carbon-calc.webp" alt="Loading video..." className="w-full h-full object-cover" />
                </div>
              )}
              
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayback}
                className="absolute bottom-4 right-4 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-foreground" />
                ) : (
                  <Play className="h-5 w-5 text-foreground" />
                )}
              </button>
              
              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Three simple steps to transform your BOQ into actionable carbon insights
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      {step.highlight}
                    </div>
                  </CardContent>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Time Comparison Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Time Comparison</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                See how CarbonConstruct stacks up against traditional methods and competitors
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {comparisons.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 md:p-6 rounded-xl border transition-all ${
                    item.highlight
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`font-medium text-lg ${item.highlight ? "text-primary" : ""}`}>
                      {item.competitor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-5 w-5 ${item.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-bold text-xl ${item.highlight ? "text-primary" : ""}`}>
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Save Hours on Every Project?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Join construction professionals who've already made the switch to faster, more accurate carbon calculations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/calculator")}
                size="lg"
                className="text-lg px-8 py-6 hover-scale shadow-lg"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Try AI BOQ Import Now
              </Button>
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                View Pricing
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <img
                src="/logo-optimized.webp?v=20251127"
                alt="CarbonConstruct"
                className="w-8 h-8"
                width="32"
                height="32"
              />
              <span className="text-lg md:text-xl font-semibold text-foreground">
                CarbonConstruct
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm md:text-base text-muted-foreground italic">
                Built by Builders
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Demo;
