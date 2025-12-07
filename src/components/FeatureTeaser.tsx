import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calculator, Upload } from "lucide-react";

interface Overlay {
  time: number;
  text: string;
  highlight?: boolean;
  centered?: boolean;
  zoomEffect?: boolean;
}

const overlays: Overlay[] = [
  { time: 2, text: "Upload your BOQ" },
  { time: 5, text: "52 materials", centered: true, zoomEffect: true },
  { time: 9, text: "15 seconds", centered: true, zoomEffect: true, highlight: true },
  { time: 13, text: "Completely filled out" },
  { time: 15, text: "Ready to calculate" },
];

export const FeatureTeaser = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeOverlays, setActiveOverlays] = useState<Overlay[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start at 2x speed
    video.playbackRate = 2.0;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      
      // Accelerate to 3x after the key stats (around 5 seconds actual time)
      if (currentTime > 5) {
        video.playbackRate = 3.0;
      } else {
        video.playbackRate = 2.0;
      }
      
      // Calculate effective time based on playback
      const effectiveTime = currentTime * 2;
      const visible = overlays.filter((o) => effectiveTime >= o.time && effectiveTime < o.time + 4);
      setActiveOverlays(visible);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

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
        <div className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-card">
          {/* Video Element */}
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

          {/* Animated Overlays */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {activeOverlays.map((overlay, index) => (
              <div
                key={overlay.time}
                className={`absolute transition-all duration-300 ${
                  overlay.centered || overlay.zoomEffect
                    ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    : index === 0
                    ? "top-2 left-2 md:top-4 md:left-4"
                    : "bottom-2 right-2 md:bottom-4 md:right-4"
                }`}
              >
                {/* Pulsing glow effect behind zoom text */}
                {overlay.zoomEffect && (
                  <div 
                    className="absolute inset-0 -z-10 rounded-xl animate-pulse-glow"
                    style={{ 
                      transform: "scale(1.2)",
                      filter: "blur(8px)"
                    }}
                  />
                )}
                <div
                  className={`font-bold ${
                    overlay.zoomEffect
                      ? `animate-zoom-forward ${
                          overlay.highlight
                            ? "bg-primary text-primary-foreground text-3xl md:text-6xl lg:text-7xl px-4 py-2 md:px-8 md:py-4 rounded-xl shadow-glow"
                            : "bg-accent text-accent-foreground text-2xl md:text-5xl lg:text-6xl px-3 py-2 md:px-6 md:py-3 rounded-lg shadow-elevated"
                        }`
                      : overlay.highlight
                      ? "bg-primary text-primary-foreground text-lg md:text-4xl px-2 py-1 md:px-6 md:py-3 rounded-md md:rounded-lg shadow-glow scale-105 md:scale-110 animate-scale-in"
                      : "bg-background/90 backdrop-blur-sm text-foreground text-xs md:text-lg px-2 py-1 md:px-6 md:py-3 rounded-md md:rounded-lg border border-border/50 animate-scale-in"
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/calculator")}
              size="lg"
              className="text-base md:text-lg px-8 py-6 hover-scale shadow-lg"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Try AI BOQ Import
            </Button>
            <Button
              onClick={() => navigate("/demo")}
              variant="outline"
              size="lg"
              className="text-base md:text-lg px-8 py-6"
            >
              See How It Works
            </Button>
          </div>

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
