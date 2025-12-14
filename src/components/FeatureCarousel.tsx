import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calculator, Database, FileText, TrendingDown, Users, Zap, Shield, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  {
    icon: Calculator,
    title: 'Carbon Calculator',
    description: 'Calculate embodied carbon for construction materials with Australian-specific emission factors',
    badge: 'Core Feature',
    gradient: 'from-blue-500/10 to-blue-600/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Database,
    title: '4,000+ EPD Materials',
    description: 'Access comprehensive database of verified Environmental Product Declarations',
    badge: 'Database',
    gradient: 'from-emerald-500/10 to-emerald-600/10',
    iconColor: 'text-emerald-600',
  },
  {
    icon: FileText,
    title: 'Professional Reports',
    description: 'Generate compliance-ready PDF reports with custom branding',
    badge: 'Reporting',
    gradient: 'from-purple-500/10 to-purple-600/10',
    iconColor: 'text-purple-600',
  },
  {
    icon: TrendingDown,
    title: 'Lifecycle Assessment',
    description: 'Full EN 15978 methodology covering A1-D lifecycle stages',
    badge: 'LCA',
    gradient: 'from-orange-500/10 to-orange-600/10',
    iconColor: 'text-orange-600',
  },
  {
    icon: Shield,
    title: 'Australian Compliance',
    description: 'Built for NCC 2024, Green Star, NABERS, and IS Rating requirements',
    badge: 'Compliance',
    gradient: 'from-red-500/10 to-red-600/10',
    iconColor: 'text-red-600',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Visualize emissions with interactive charts and hotspot analysis',
    badge: 'Analytics',
    gradient: 'from-indigo-500/10 to-indigo-600/10',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share projects and collaborate with your team in real-time',
    badge: 'Pro Feature',
    gradient: 'from-pink-500/10 to-pink-600/10',
    iconColor: 'text-pink-600',
  },
  {
    icon: Zap,
    title: 'AI Recommendations',
    description: 'Get intelligent suggestions to reduce your project carbon footprint',
    badge: 'AI Powered',
    gradient: 'from-yellow-500/10 to-yellow-600/10',
    iconColor: 'text-yellow-600',
  },
];

interface FeatureCarouselProps {
  autoplay?: boolean;
  className?: string;
}

export const FeatureCarousel = ({ autoplay = false, className = '' }: FeatureCarouselProps) => {
  return (
    <div className={`w-full max-w-6xl mx-auto px-4 ${className}`}>
      <Carousel
        opts={{
          align: 'start',
          loop: autoplay,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                        <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
};

export default FeatureCarousel;
