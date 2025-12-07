import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

export const DeleteAccountButton = () => {
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      toast.error('Unable to verify account');
      return;
    }

    if (confirmEmail !== user.email) {
      toast.error('Email does not match your account email');
      return;
    }

    setIsDeleting(true);

    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { confirmEmail }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Your account has been deleted');
        // Sign out and redirect
        await signOut();
      } else {
        throw new Error(data?.error || 'Failed to delete account');
      }
    } catch (error) {
      logger.error('DeleteAccountButton:handleDelete', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
      setConfirmEmail('');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete My Account
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
                This action is <strong>permanent and irreversible</strong>. All your data will be deleted, including:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>All projects and calculations</li>
                <li>Generated reports</li>
                <li>Account preferences and settings</li>
                <li>Subscription and billing history</li>
                <li>All analytics and usage data</li>
              </ul>
              <div className="pt-2">
                <Label htmlFor="confirm-email" className="text-foreground">
                  Type your email to confirm: <strong>{user?.email}</strong>
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="Enter your email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="mt-2"
                  disabled={isDeleting}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmEmail !== user?.email}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account Permanently'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
