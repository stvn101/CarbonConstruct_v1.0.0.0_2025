import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Factory, Zap, Truck, Calculator, FileBarChart, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    route: string;
  };
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to CarbonConstruct",
    description: "Your professional carbon emissions calculator for Australian construction projects. Designed for NCC Section J compliance, Green Star ratings, and NABERS requirements. Let's take a quick tour.",
    icon: Calculator,
  },
  {
    title: "Understanding Emission Scopes",
    description: "Carbon emissions are divided into three scopes following ISO 14064 and the GHG Protocol. Scope 1 covers direct on-site emissions, Scope 2 covers purchased energy (varying by Australian state), and Scope 3 covers your entire value chain including embodied carbon in materials.",
    icon: Factory,
  },
  {
    title: "Create Your First Project",
    description: "Start by creating a project with the Project Selector. Enter your location (Australian state matters for electricity factors), building size, and target compliance level. This ensures accurate calculations using NGA Factors 2023.",
    icon: FileBarChart,
  },
  {
    title: "Calculate Scope 1 Emissions",
    description: "Calculate direct emissions from diesel generators, LPG heaters, company vehicles, and on-site equipment. Australian construction often sees high Scope 1 during earthworks and wet season operations.",
    icon: Factory,
    action: {
      label: "Go to Scope 1",
      route: "/scope-1",
    },
  },
  {
    title: "Calculate Scope 2 Emissions",
    description: "Track purchased electricity emissions. Factors vary significantly by state—Tasmania's hydro-dominated grid is much cleaner than Victoria's. Consider renewable energy certificates (LGCs) to reduce Scope 2.",
    icon: Zap,
    action: {
      label: "Go to Scope 2",
      route: "/scope-2",
    },
  },
  {
    title: "Calculate Scope 3 Emissions",
    description: "Often 70-80% of construction emissions come from materials (embodied carbon). Track concrete, steel, aluminium, and other materials using our EPD database. Use the AI BOQ Import to automatically extract materials from your Bill of Quantities.",
    icon: Truck,
    action: {
      label: "Go to Scope 3",
      route: "/scope-3",
    },
  },
  {
    title: "Generate Compliance Reports",
    description: "Generate reports for Green Star submissions, NCC compliance documentation, or stakeholder presentations. Export as PDF with full methodology notes and Australian emission factor references.",
    icon: FileBarChart,
    action: {
      label: "View Reports",
      route: "/reports",
    },
  },
  {
    title: "You're All Set!",
    description: "Start calculating emissions for your Australian construction projects. Remember: consider seasonal impacts (wet season logistics, hot weather concrete curing) and always verify material quantities from EPDs where available.",
    icon: CheckCircle2,
  },
];

interface OnboardingTutorialProps {
  onComplete?: () => void;
}

export const OnboardingTutorial = ({ onComplete }: OnboardingTutorialProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setOpen(false);
  };

  const handleActionClick = () => {
    const action = steps[currentStep].action;
    if (action) {
      handleComplete();
      navigate(action.route);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">{currentStepData.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentStepData.action && (
            <Button
              onClick={handleActionClick}
              className="w-full"
              variant="outline"
            >
              {currentStepData.action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip Tutorial
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? "Next" : "Get Started"}
              {currentStep < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const restartOnboarding = () => {
  localStorage.removeItem("hasSeenOnboarding");
  window.location.reload();
};
