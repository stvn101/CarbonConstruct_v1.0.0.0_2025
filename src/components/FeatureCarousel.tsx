import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { CheckCircle, Zap, Pause, Play, Scale, Upload, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

const features = [
  {
    icon: Scale,
    title: "Material Comparer",
    description: "Compare carbon footprints across 4,000+ verified EPD materials side-by-side.",
    gradient: "gradient-eco-feature",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    accentColor: "border-emerald-500/30",
  },
  {
    icon: Upload,
    title: "Bulk EPD Uploader",
    description: "Upload and process multiple EPD PDFs at once with AI-powered extraction.",
    gradient: "gradient-sunset-feature",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    accentColor: "border-amber-500/30",
  },
  {
    icon: BarChart3,
    title: "LCA Dashboard",
    description: "Full EN 15978 lifecycle assessment with A-D stage breakdown visualization.",
    gradient: "gradient-ocean-feature",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    accentColor: "border-cyan-500/30",
  },
  {
    icon: CheckCircle,
    title: "Compliance Cards",
    description: "Instant NCC, Green Star, NABERS, and IS Rating compliance checks.",
    gradient: "gradient-carbon-feature",
    iconBg: "bg-slate-500/20",
    iconColor: "text-slate-300",
    accentColor: "border-slate-500/30",
  },
  {
    icon: Zap,
    title: "Quick Calculator",
    description: "Get instant carbon estimates without signing up. Try it above!",
    gradient: "gradient-purple-feature",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    accentColor: "border-purple-500/30",
  },
];

export function FeatureCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { ref: carouselRef, isInView } = useInViewAnimation<HTMLDivElement>();

  // Track current slide
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    // Set initial value
    onSelect();
    
    // Listen for changes
    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Auto-play logic (5s interval, pause on hover)
  useEffect(() => {
    if (!api || isPaused) return;
    const interval = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api, isPaused]);

  // Keyboard shortcut: spacebar to toggle pause/play
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" && e.target === document.body) {
      e.preventDefault();
      setIsPaused(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      ref={carouselRef}
      className="w-full max-w-5xl mx-auto px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground dark:text-white">
          Powerful Tools for Carbon Assessment
        </h2>
        <p className="text-muted-foreground dark:text-white/70">
          Everything you need for professional construction carbon reporting
        </p>
      </div>
      
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {features.map((feature, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card 
                className={cn(
                  "h-full border transition-all duration-500 relative overflow-hidden group",
                  "bg-card/95 dark:bg-card/80 backdrop-blur-sm",
                  isInView ? "animate-slide-up opacity-100" : "opacity-0 translate-y-8",
                  feature.accentColor,
                  "hover:shadow-glass-hover hover:-translate-y-1"
                )}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient overlay */}
                <div className={cn("absolute inset-0 opacity-30 dark:opacity-50", feature.gradient)} />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="shimmer absolute inset-0" />
                </div>
                
                <CardHeader className="pb-2 relative z-10">
                  {/* Icon with ambient glow */}
                  <div 
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-500",
                      isInView ? "animate-pop-in opacity-100 scale-100" : "opacity-0 scale-75",
                      feature.iconBg,
                      "group-hover:scale-110 group-hover:shadow-lg"
                    )}
                    style={{ 
                      animationDelay: `${index * 100 + 150}ms`,
                      transitionDelay: `${index * 100 + 150}ms`,
                    }}
                  >
                    <feature.icon className={cn("h-7 w-7", feature.iconColor)} />
                  </div>
                  <CardTitle className="text-lg text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4 bg-card border-border text-foreground hover:bg-muted" />
        <CarouselNext className="hidden sm:flex -right-4 bg-card border-border text-foreground hover:bg-muted" />
      </Carousel>

      {/* Controls: Dot indicators + Pause/Play button */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <div className="flex gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                current === index 
                  ? "w-6 bg-primary" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? "Resume carousel auto-play" : "Pause carousel auto-play"}
          className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors text-foreground"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
