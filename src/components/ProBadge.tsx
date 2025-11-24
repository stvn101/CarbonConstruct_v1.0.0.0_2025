import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProBadgeProps {
  className?: string;
}

export const ProBadge = ({ className }: ProBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="default" className={`gap-1 ${className}`}>
            <Crown className="h-3 w-3" />
            Pro
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This feature requires a Pro subscription</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
