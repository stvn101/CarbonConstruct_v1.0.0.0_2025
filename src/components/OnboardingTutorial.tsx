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
    description: "Your professional carbon emissions calculator for Australian construction projects. Let's take a quick tour to help you get started with calculating your project's carbon footprint.",
    icon: Calculator,
  },
  {
    title: "Understanding Emission Scopes",
    description: "Carbon emissions are divided into three scopes: Scope 1 (direct emissions from your operations), Scope 2 (indirect emissions from energy), and Scope 3 (value chain emissions). You'll need to calculate all three for complete compliance.",
    icon: Factory,
  },
  {
    title: "Create Your First Project",
    description: "Start by creating a project using the Project Selector. Enter your project details including location, size, and assessment period. This helps us provide accurate emission factors for your region.",
    icon: FileBarChart,
  },
  {
    title: "Calculate Scope 1 Emissions",
    description: "Navigate to Scope 1 to calculate direct emissions from fuel combustion, company vehicles, and on-site equipment. Enter quantities and select the appropriate fuel types.",
    icon: Factory,
    action: {
      label: "Go to Scope 1",
      route: "/scope-1",
    },
  },
  {
    title: "Calculate Scope 2 Emissions",
    description: "In Scope 2, calculate indirect emissions from purchased electricity, heating, and cooling. Select your state/region for accurate emission factors based on the local grid mix.",
    icon: Zap,
    action: {
      label: "Go to Scope 2",
      route: "/scope-2",
    },
  },
  {
    title: "Calculate Scope 3 Emissions",
    description: "Scope 3 covers your value chain emissions including purchased goods, transportation, waste, and employee commuting. This is often the largest contributor to total emissions.",
    icon: Truck,
    action: {
      label: "Go to Scope 3",
      route: "/scope-3",
    },
  },
  {
    title: "Generate Reports",
    description: "Once you've entered your data, generate comprehensive reports for compliance and analysis. Export as PDF for stakeholders or regulatory submissions.",
    icon: FileBarChart,
    action: {
      label: "View Reports",
      route: "/reports",
    },
  },
  {
    title: "You're All Set!",
    description: "You're ready to start calculating carbon emissions for your construction projects. Remember, you can access Help & Resources anytime from the sidebar for detailed guidance on emission factors and methodologies.",
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
