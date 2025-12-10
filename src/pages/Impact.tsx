import { Leaf, TrendingUp, Recycle, Globe, Target, Users, ExternalLink, Award, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuickCarbonCalculator } from '@/components/QuickCarbonCalculator';

const Impact = () => {
  const impactStats = [
    {
      value: '1%',
      label: 'Revenue to Carbon Removal',
      description: 'Every subscription contributes directly to verified carbon removal projects',
      icon: Leaf,
      color: 'text-green-600'
    },
    {
      value: '100%',
      label: 'Australian Standards',
      description: 'All calculations comply with NCC 2024 and Green Star requirements',
      icon: CheckCircle2,
      color: 'text-blue-600'
    },
    {
      value: 'New',
      label: 'Platform Launch',
      description: 'Helping Australian construction projects track and reduce carbon emissions',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      value: '3',
      label: 'Emission Scopes',
      description: 'Comprehensive tracking across Scope 1, 2, and 3 emissions with LCA materials',
      icon: Globe,
      color: 'text-orange-600'
    }
  ];

  const carbonRemovalProjects = [
    {
      name: 'Direct Air Capture',
      provider: 'Climeworks',
      description: 'Technology that captures CO2 directly from the atmosphere and stores it permanently underground',
      impact: 'High permanence, scalable solution',
      badge: 'Technology'
    },
    {
      name: 'Enhanced Weathering',
      provider: 'Project Vesta',
      description: 'Accelerates natural carbon mineralization by spreading minerals on beaches to absorb CO2',
      impact: 'Ocean health benefits',
      badge: 'Nature-Based'
    },
    {
      name: 'Bio-Oil Sequestration',
      provider: 'Charm Industrial',
      description: 'Converts agricultural waste into bio-oil and injects it deep underground for permanent storage',
      impact: 'Waste reduction + carbon removal',
      badge: 'Hybrid'
    },
    {
      name: 'Biomass Carbon Removal',
      provider: 'Running Tide',
      description: 'Grows kelp forests that sink to the ocean floor, storing carbon for millennia',
      impact: 'Marine ecosystem restoration',
      badge: 'Nature-Based'
    }
  ];

  const initiatives = [
    {
      title: 'Carbon-Aware Computing',
      description: 'Our servers automatically shift workloads to times when renewable energy is most abundant',
      icon: Recycle,
      status: 'Active'
    },
    {
      title: 'Paperless Operations',
      description: 'Digital-first approach reduces paper waste and promotes efficient documentation',
      icon: Globe,
      status: 'Active'
    },
    {
      title: 'Green Partnerships',
      description: 'Working exclusively with cloud providers committed to 100% renewable energy',
      icon: Users,
      status: 'Active'
    },
    {
      title: 'Net Zero by 2030',
      description: 'Committed to achieving net-zero emissions across all operations by 2030',
      icon: Target,
      status: 'In Progress'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Leaf className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">Our Environmental Impact</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Building a sustainable future through technology, transparency, and commitment to carbon removal
        </p>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {impactStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="hover-scale border-2 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="font-semibold text-sm mb-2">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Carbon Calculator */}
      <QuickCarbonCalculator />

      {/* Stripe Climate Partnership */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Stripe Climate Partnership</CardTitle>
              <CardDescription className="text-base mt-1">
                Proudly contributing to frontier carbon removal technologies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Through our partnership with Stripe Climate, <strong>1% of every subscription</strong> goes directly 
            to funding cutting-edge carbon removal technologies. We believe in supporting frontier solutions 
            that will scale to help reverse climate change.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-sm">
              Verified Carbon Removal
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Transparent Impact
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Science-Based Approach
            </Badge>
          </div>
          <Button variant="outline" className="mt-4" asChild>
            <a href="https://climate.stripe.com/qDm9Cw" target="_blank" rel="noopener noreferrer">
              View Our Climate Dashboard
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Carbon Removal Projects */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Carbon Removal Projects We Support</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stripe Climate carefully vets and funds the most promising carbon removal technologies
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {carbonRemovalProjects.map((project, idx) => (
            <Card key={idx} className="hover-scale animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <Badge variant="outline">{project.badge}</Badge>
                </div>
                <CardDescription className="font-semibold text-primary">{project.provider}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{project.impact}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Our Sustainability Initiatives */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Our Sustainability Initiatives</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Beyond carbon removal, we're committed to sustainable operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {initiatives.map((initiative, idx) => {
            const Icon = initiative.icon;
            return (
              <Card key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{initiative.title}</h3>
                        <Badge variant={initiative.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                          {initiative.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{initiative.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Our Commitments - Honest Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Our Sustainability Commitments</CardTitle>
          <CardDescription>Transparent progress on our environmental goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Cloud Infrastructure (AWS/Vercel)</span>
              <Badge variant="outline" className="text-xs">Powered by renewable commitments</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Our hosting providers have committed to 100% renewable energy</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Stripe Climate Contribution</span>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">1% of revenue automatically directed to carbon removal projects</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Digital-First Operations</span>
              <Badge variant="default" className="text-xs">100% Paperless</Badge>
            </div>
            <p className="text-xs text-muted-foreground">All documentation and invoicing is fully digital</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Net Zero Goal</span>
              <Badge variant="secondary" className="text-xs">Target: 2030</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Working toward carbon neutrality across all operations</p>
          </div>
          
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <p>
              <strong>Transparency note:</strong> We publish honest metrics. View our verified carbon removal contribution on 
              <a href="https://climate.stripe.com/qDm9Cw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                Stripe Climate Dashboard
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-center">
        <CardContent className="py-12 px-6">
          <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Join Us in Making an Impact</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every project you track with CarbonConstruct contributes to a more sustainable future. 
            Together, we're building the construction industry's path to net zero.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/pricing">
                Start Your Free Trial
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="https://climate.stripe.com/qDm9Cw" target="_blank" rel="noopener noreferrer">
                Learn More
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Impact;
