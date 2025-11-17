import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export const CheckoutSuccessHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refetch } = useSubscriptionStatus();

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    
    if (checkoutStatus === 'success') {
      toast({
        title: 'Welcome to Pro! 🎉',
        description: 'Your 14-day trial has started. Enjoy unlimited access to all features.',
      });
      
      // Refresh subscription status
      setTimeout(() => {
        refetch();
      }, 2000);
      
      // Clean up URL
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    } else if (checkoutStatus === 'cancelled') {
      toast({
        title: 'Checkout Cancelled',
        description: 'No worries! You can upgrade anytime from the pricing page.',
        variant: 'default',
      });
      
      // Clean up URL
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refetch]);

  return null;
};
