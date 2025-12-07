import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Trash2, AlertTriangle, PauseCircle, PlayCircle, Clock, XCircle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useSearchParams } from 'react-router-dom';

interface AccountStatus {
  account_status: 'active' | 'suspended' | 'pending_deletion';
  deletion_scheduled_at: string | null;
}

export const AccountStatusManager = () => {
  const { user, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  // Fetch account status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('account_status, deletion_scheduled_at')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setAccountStatus(data as AccountStatus);
      }
    };

    fetchStatus();
  }, [user]);

  // Handle cancel deletion from URL param
  useEffect(() => {
    const cancelToken = searchParams.get('cancel_deletion');
    if (cancelToken) {
      handleCancelDeletion(cancelToken);
      // Remove the param from URL
      searchParams.delete('cancel_deletion');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const handleCancelDeletion = async (token: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-deletion', {
        body: { token }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Account deletion cancelled');
        setAccountStatus({ account_status: 'active', deletion_scheduled_at: null });
      } else {
        throw new Error(data?.error || 'Failed to cancel deletion');
      }
    } catch (error) {
      logger.error('AccountStatusManager:cancelDeletion', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel deletion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendAccount = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suspend-account', {
        body: { action: 'suspend' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Account suspended');
        setAccountStatus({ account_status: 'suspended', deletion_scheduled_at: null });
        await signOut();
      } else {
        throw new Error(data?.error || 'Failed to suspend account');
      }
    } catch (error) {
      logger.error('AccountStatusManager:suspend', error);
      toast.error(error instanceof Error ? error.message : 'Failed to suspend account');
    } finally {
      setIsLoading(false);
      setIsSuspendDialogOpen(false);
    }
  };

  const handleReactivateAccount = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suspend-account', {
        body: { action: 'reactivate' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Account reactivated');
        setAccountStatus({ account_status: 'active', deletion_scheduled_at: null });
      } else {
        throw new Error(data?.error || 'Failed to reactivate account');
      }
    } catch (error) {
      logger.error('AccountStatusManager:reactivate', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleDeletion = async () => {
    if (!user?.email || confirmEmail !== user.email) {
      toast.error('Email does not match your account email');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-deletion', {});

      if (error) throw error;

      if (data?.success) {
        toast.success('Deletion scheduled. Check your email for confirmation.');
        setAccountStatus({ 
          account_status: 'pending_deletion', 
          deletion_scheduled_at: data.deletion_scheduled_at 
        });
      } else {
        throw new Error(data?.error || 'Failed to schedule deletion');
      }
    } catch (error) {
      logger.error('AccountStatusManager:scheduleDeletion', error);
      toast.error(error instanceof Error ? error.message : 'Failed to schedule deletion');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setConfirmEmail('');
    }
  };

  const getStatusBadge = () => {
    switch (accountStatus?.account_status) {
      case 'suspended':
        return <Badge variant="secondary" className="gap-1"><PauseCircle className="h-3 w-3" /> Suspended</Badge>;
      case 'pending_deletion':
        return <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" /> Pending Deletion</Badge>;
      default:
        return <Badge variant="outline" className="gap-1 text-green-600 border-green-600"><PlayCircle className="h-3 w-3" /> Active</Badge>;
    }
  };

  const formatDeletionTime = () => {
    if (!accountStatus?.deletion_scheduled_at) return null;
    const date = new Date(accountStatus.deletion_scheduled_at);
    return date.toLocaleString('en-AU', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'Australia/Sydney' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Account Status</Label>
        {getStatusBadge()}
      </div>

      {accountStatus?.account_status === 'pending_deletion' && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Deletion Scheduled</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your account will be permanently deleted on {formatDeletionTime()} (AEST).
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleCancelDeletion(accountStatus?.deletion_scheduled_at ? '' : '')}
            disabled={isLoading}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel Deletion
          </Button>
        </div>
      )}

      {accountStatus?.account_status === 'suspended' && (
        <div className="bg-muted border rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Your account is suspended. Your data is preserved but you cannot access most features.
          </p>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleReactivateAccount}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Reactivate Account
          </Button>
        </div>
      )}

      {accountStatus?.account_status === 'active' && (
        <div className="flex flex-wrap gap-2">
          {/* Suspend Account Dialog */}
          <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <PauseCircle className="h-4 w-4" />
                Suspend Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Suspend Your Account?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>Suspending your account will:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Log you out immediately</li>
                      <li>Preserve all your data</li>
                      <li>Prevent access to calculations and reports</li>
                      <li>Pause any active subscriptions</li>
                    </ul>
                    <p className="text-sm">You can reactivate anytime by logging back in.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSuspendAccount} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Suspend Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Account Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Your Account
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>
                      This will schedule your account for <strong>permanent deletion in 24 hours</strong>. 
                      You'll receive an email with a link to cancel if you change your mind.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-3">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        After 24 hours, all your data will be permanently deleted including projects, calculations, reports, and preferences.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Label htmlFor="confirm-delete-email" className="text-foreground">
                        Type your email to confirm: <strong>{user?.email}</strong>
                      </Label>
                      <Input
                        id="confirm-delete-email"
                        type="email"
                        placeholder="Enter your email"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        className="mt-2"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleScheduleDeletion}
                  disabled={isLoading || confirmEmail !== user?.email}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Schedule Deletion
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};
