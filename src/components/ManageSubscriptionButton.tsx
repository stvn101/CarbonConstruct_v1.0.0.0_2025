import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Settings } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

interface ManageSubscriptionButtonProps {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const ManageSubscriptionButton = ({ 
  variant = 'outline',
  size = 'default',
  className 
}: ManageSubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();

  const handleManage = async () => {
    if (!user || !session) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage your subscription',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open portal in new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      logger.error('ManageSubscriptionButton:handleManage', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open customer portal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleManage} 
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Settings className="mr-2 h-4 w-4" />
          Manage Subscription
        </>
      )}
    </Button>
  );
};
