import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </Card>
  );
};
