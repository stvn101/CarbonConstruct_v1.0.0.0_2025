import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calculator, Upload } from "lucide-react";

interface Overlay {
  time: number;
  duration: number;
  text: string;
  highlight?: boolean;
}

const overlays: Overlay[] = [
  { time: 0, duration: 4.5, text: "Upload your BOQ" },
  { time: 5.5, duration: 5.5, text: "52 materials", highlight: true },
  { time: 12, duration: 5.5, text: "15 seconds", highlight: true },
  { time: 18.5, duration: 4.5, text: "Completely filled out" },
  { time: 24, duration: 4.5, text: "Ready to calculate" },
];

export const FeatureTeaser = () => {
  // Defensive navigation - useNavigate may fail if Router context is unavailable during edge cases
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch {
    // Router context not available - will use fallback
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeOverlays, setActiveOverlays] = useState<Overlay[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const handleNavigate = useCallback(() => {
    if (navigate) {
      navigate("/calculator");
    } else {
      window.location.href = "/calculator";
    }
  }, [navigate]);

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
    if (!video || !isVisible) return;

    // Slower playback for better readability
    video.playbackRate = 1.5;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      
      // Calculate effective time based on playback speed
      const effectiveTime = currentTime * 1.5;
      const visible = overlays.filter(
        (o) => effectiveTime >= o.time && effectiveTime < o.time + o.duration
      );
      setActiveOverlays(visible);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [isVisible]);

  return (
    <section className="py-12 md:py-20 animate-fade-in">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Upload className="h-4 w-4" />
            AI-Powered BOQ Import
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-muted-foreground line-through decoration-2">90 Minutes</span>
            <span className="mx-3 text-primary">→</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">15 Seconds</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            What takes 90 minutes in other calculators takes 15 seconds in CarbonConstruct.
          </p>
        </div>

        {/* Video Container */}
        <div ref={containerRef} className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-card">
          {/* Video Element - Lazy Loaded */}
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

          {/* Animated Overlays */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {activeOverlays.map((overlay) => (
              <div
                key={overlay.time}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in"
              >
                {/* Pulsing glow effect behind all cards */}
                <div 
                  className="absolute inset-0 -z-10 rounded-2xl animate-pulse-glow"
                  style={{ 
                    transform: "scale(1.3)",
                    filter: "blur(12px)",
                    opacity: overlay.highlight ? 0.8 : 0.5
                  }}
                />
                <div
                  className={`animate-zoom-forward font-bold rounded-2xl transition-opacity duration-500 ease-in-out ${
                    overlay.highlight
                      ? "bg-primary/80 backdrop-blur-md text-primary-foreground text-2xl md:text-5xl lg:text-6xl px-6 py-3 md:px-10 md:py-5 shadow-glow border border-primary-foreground/20"
                      : "bg-background/60 backdrop-blur-md text-foreground text-xl md:text-4xl lg:text-5xl px-5 py-3 md:px-8 md:py-4 shadow-elevated border border-border/30"
                  }`}
                >
                  {overlay.text}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* CTA and Tagline */}
        <div className="text-center mt-8 md:mt-12 space-y-6">
          <Button
            onClick={handleNavigate}
            size="lg"
            className="text-base md:text-lg px-8 py-6 hover-scale shadow-lg"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Try AI BOQ Import
          </Button>

          <div className="flex items-center justify-center gap-3">
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
      </div>
    </section>
  );
};
