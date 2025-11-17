import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export const WebhookStatusCard = () => {
  const [copied, setCopied] = useState(false);
  
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Webhook URL copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stripe Webhook Status</CardTitle>
            <CardDescription>Real-time subscription synchronization</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Configured
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Webhook Endpoint URL</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-muted rounded-md text-sm font-mono break-all">
              {webhookUrl}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold">Setup Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Copy the webhook URL above</li>
            <li>Go to Stripe Dashboard → Webhooks</li>
            <li>Click "Add endpoint" and paste the URL</li>
            <li>Select the required events (see documentation)</li>
            <li>Copy the signing secret and add it to secrets</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Stripe Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/STRIPE_WEBHOOK_SETUP.md', '_blank')}
          >
            View Setup Guide
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Monitored Events:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              'subscription.created',
              'subscription.updated',
              'subscription.deleted',
              'payment.succeeded',
              'payment.failed',
              'trial.will_end',
            ].map((event) => (
              <Badge key={event} variant="secondary" className="text-xs">
                {event}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> Webhooks enable real-time sync of subscription status, trial periods, 
          and payment events. Without proper webhook configuration, subscription status may be delayed.
        </div>
      </CardContent>
    </Card>
  );
};
