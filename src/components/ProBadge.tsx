import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProBadgeProps {
  className?: string;
}

export const ProBadge = ({ className }: ProBadgeProps) => {
  return (
    <Badge variant="default" className={`gap-1 ${className}`} title="This feature requires a Pro subscription">
      <Crown className="h-3 w-3" />
      Pro
    </Badge>
  );
};
