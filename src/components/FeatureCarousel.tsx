import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Calculator, FileBarChart, Layers, CheckCircle, Zap, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Layers,
    title: "Material Comparer",
    description: "Compare carbon footprints across 4,000+ verified EPD materials side-by-side.",
  },
  {
    icon: FileBarChart,
    title: "Bulk EPD Uploader",
    description: "Upload and process multiple EPD PDFs at once with AI-powered extraction.",
  },
  {
    icon: Calculator,
    title: "LCA Dashboard",
    description: "Full EN 15978 lifecycle assessment with A-D stage breakdown visualization.",
  },
  {
    icon: CheckCircle,
    title: "Compliance Cards",
    description: "Instant NCC, Green Star, NABERS, and IS Rating compliance checks.",
  },
  {
    icon: Zap,
    title: "Quick Calculator",
    description: "Get instant carbon estimates without signing up. Try it above!",
  },
];

export function FeatureCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Track current slide
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  // Auto-play logic (5s interval, pause on hover)
  useEffect(() => {
    if (!api || isPaused) return;
    const interval = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api, isPaused]);

  return (
    <div 
      className="w-full max-w-5xl mx-auto px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
          Powerful Tools for Carbon Assessment
        </h2>
        <p className="text-muted-foreground">
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
              <Card variant="glass" className="h-full border-primary/10">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4 glass border-primary/20" />
        <CarouselNext className="hidden sm:flex -right-4 glass border-primary/20" />
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
          className="p-2 rounded-full glass border border-primary/20 hover:bg-primary/10 transition-colors"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
