import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";
import { useInViewAnimation, useStaggeredAnimation } from "@/hooks/useInViewAnimation";
import { 
  Sparkles, 
  Layers, 
  Palette, 
  MousePointer2, 
  Loader2,
  ArrowRight,
  Check,
  Star
} from "lucide-react";

const DesignSystem = () => {
  const { ref: glassRef, isInView: glassInView } = useInViewAnimation();
  const { ref: buttonsRef, isInView: buttonsInView } = useInViewAnimation();
  const { ref: skeletonRef, isInView: skeletonInView } = useInViewAnimation();
  const { ref: animRef, isInView: animInView, getStaggerDelay } = useStaggeredAnimation(100);

  return (
    <>
      <SEOHead
        title="Design System | CarbonConstruct"
        description="Glassmorphism design system documentation showcasing components, animations, and skeleton variants."
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 md:py-24 carbon-surface noise-texture">
          <div className="container mx-auto px-4 text-center">
            <Badge className="glass mb-6 text-sm">Design System v1.0</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient-animated">
              Glassmorphism UI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern design system featuring glass effects, smooth animations, and dark mode support.
            </p>
          </div>
        </section>

        {/* Glass Cards Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Glass Cards</h2>
            <p className="text-muted-foreground mb-8">Frosted glass effect cards with backdrop blur and subtle borders.</p>
            
            <div 
              ref={glassRef}
              className="grid md:grid-cols-3 gap-6"
            >
              <Card 
                variant="glass" 
                className={`glass-glow-hover transition-all duration-500 ${glassInView ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
                style={{ animationDelay: '0ms' }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Default Glass</CardTitle>
                  <CardDescription>Standard glass card with hover glow effect</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Uses <code className="bg-muted px-1 rounded">variant="glass"</code> and <code className="bg-muted px-1 rounded">.glass-glow-hover</code>
                  </p>
                </CardContent>
              </Card>

              <Card 
                variant="glassDark" 
                className={`glass-glow-hover transition-all duration-500 ${glassInView ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
                style={{ animationDelay: '100ms' }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <Layers className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Dark Glass</CardTitle>
                  <CardDescription>Darker variant for contrast sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Uses <code className="bg-muted px-1 rounded">variant="glassDark"</code>
                  </p>
                </CardContent>
              </Card>

              <div 
                className={`glass p-6 rounded-xl glass-glow-hover transition-all duration-500 ${glassInView ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
                style={{ animationDelay: '200ms' }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                  <Palette className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Raw Glass Class</h3>
                <p className="text-sm text-muted-foreground">
                  Apply <code className="bg-muted px-1 rounded">.glass</code> directly to any element
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="py-16 md:py-24 carbon-surface">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Glass Buttons</h2>
            <p className="text-muted-foreground mb-8">Button variants with glass effects and glow animations.</p>
            
            <div 
              ref={buttonsRef}
              className={`flex flex-wrap gap-4 transition-all duration-500 ${buttonsInView ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
            >
              <Button variant="glass" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Glass Button
              </Button>
              <Button variant="glassOutline" size="lg">
                <MousePointer2 className="mr-2 h-4 w-4" />
                Glass Outline
              </Button>
              <Button variant="glass" size="lg" className="glow-ring">
                <Star className="mr-2 h-4 w-4" />
                With Glow Ring
              </Button>
              <Button variant="default" size="lg" className="shimmer-hover">
                <ArrowRight className="mr-2 h-4 w-4" />
                Shimmer Hover
              </Button>
            </div>

            <div className="mt-8 glass p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Variants:</strong> <code>glass</code>, <code>glassOutline</code><br />
                <strong>Effects:</strong> <code>.glow-ring</code>, <code>.shimmer-hover</code>
              </p>
            </div>
          </div>
        </section>

        {/* Skeleton Variants */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Glass Skeletons</h2>
            <p className="text-muted-foreground mb-8">Loading states with glassmorphism styling.</p>
            
            <div 
              ref={skeletonRef}
              className={`grid md:grid-cols-3 gap-6 transition-all duration-500 ${skeletonInView ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
            >
              {/* Default Skeleton */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Default Skeleton
                </h3>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">variant="default"</code>
              </div>

              {/* Glass Skeleton */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Glass Skeleton
                </h3>
                <div className="space-y-2">
                  <Skeleton variant="glass" className="h-4 w-full" />
                  <Skeleton variant="glass" className="h-4 w-3/4" />
                  <Skeleton variant="glass" className="h-4 w-1/2" />
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">variant="glass"</code>
              </div>

              {/* Glass Light Skeleton */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Glass Light Skeleton
                </h3>
                <div className="space-y-2">
                  <Skeleton variant="glassLight" className="h-4 w-full" />
                  <Skeleton variant="glassLight" className="h-4 w-3/4" />
                  <Skeleton variant="glassLight" className="h-4 w-1/2" />
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">variant="glassLight"</code>
              </div>
            </div>

            {/* Skeleton Components */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">SkeletonCard Component</h3>
                <SkeletonCard />
                <code className="text-xs bg-muted px-2 py-1 rounded mt-4 inline-block">{"<SkeletonCard />"}</code>
              </div>
              <div>
                <h3 className="font-semibold mb-4">SkeletonText Component</h3>
                <SkeletonText lines={4} />
                <code className="text-xs bg-muted px-2 py-1 rounded mt-4 inline-block">{"<SkeletonText lines={4} />"}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Animations Section */}
        <section className="py-16 md:py-24 carbon-surface">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Entrance Animations</h2>
            <p className="text-muted-foreground mb-8">Staggered animations triggered by intersection observer.</p>
            
            <div 
              ref={animRef}
              className="grid md:grid-cols-3 gap-4"
            >
              {['slide-up', 'slide-in-left', 'pop-in', 'fade-in', 'scale-in', 'slide-up'].map((anim, index) => (
                <div
                  key={index}
                  className={`glass p-6 rounded-xl text-center transition-all duration-500 ${
                    animInView ? `animate-${anim} opacity-100` : 'opacity-0'
                  }`}
                  style={getStaggerDelay(index)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">.animate-{anim}</p>
                  <p className="text-xs text-muted-foreground mt-1">stagger-{index + 1}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 glass p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Animation Classes:</strong> <code>.animate-slide-up</code>, <code>.animate-slide-in-left</code>, <code>.animate-pop-in</code><br />
                <strong>Stagger Delays:</strong> <code>.stagger-1</code> through <code>.stagger-6</code> (100ms increments)<br />
                <strong>Hook:</strong> <code>useInViewAnimation()</code>, <code>useStaggeredAnimation()</code>
              </p>
            </div>
          </div>
        </section>

        {/* Effects Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Special Effects</h2>
            <p className="text-muted-foreground mb-8">Advanced visual effects and utilities.</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-xl shimmer">
                <h3 className="font-semibold mb-2">Shimmer</h3>
                <p className="text-sm text-muted-foreground">.shimmer</p>
              </div>
              
              <div className="glass p-6 rounded-xl glow-ring">
                <h3 className="font-semibold mb-2">Glow Ring</h3>
                <p className="text-sm text-muted-foreground">.glow-ring</p>
              </div>
              
              <div className="glass p-6 rounded-xl noise-texture">
                <h3 className="font-semibold mb-2">Noise Texture</h3>
                <p className="text-sm text-muted-foreground">.noise-texture</p>
              </div>
              
              <div className="glass p-6 rounded-xl shadow-glass-hover">
                <h3 className="font-semibold mb-2">Glass Shadow</h3>
                <p className="text-sm text-muted-foreground">.shadow-glass-hover</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">Gradient Text</h3>
              <p className="text-4xl font-bold text-gradient-animated">
                Animated Gradient Text
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded mt-4 inline-block">.text-gradient-animated</code>
            </div>
          </div>
        </section>

        {/* Dark Mode Section */}
        <section className="py-16 md:py-24 carbon-surface">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Dark Mode Ready</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              All glassmorphism components automatically adapt to dark mode with adjusted opacities and glow colors.
            </p>
            <div className="glass p-6 rounded-xl max-w-md mx-auto">
              <p className="text-sm">
                Toggle your system theme to see the dark mode variants in action.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DesignSystem;
