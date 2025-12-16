import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Crown } from 'lucide-react';
import { logger } from '@/lib/logger';

interface CheckoutButtonProps {
  priceId: string;
  tierName: string;
  variant?: 'default' | 'outline';
  className?: string;
  children?: React.ReactNode;
  discountCode?: string;
}

export const CheckoutButton = ({ 
  priceId, 
  tierName, 
  variant = 'default',
  className,
  children,
  discountCode
}: CheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price_id: priceId, tier_name: tierName, discount_code: discountCode },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open checkout in new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      logger.error('CheckoutButton:handleCheckout', error);
      toast({
        title: 'Checkout Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children || (
          <>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to {tierName}
          </>
        )
      )}
    </Button>
  );
};
