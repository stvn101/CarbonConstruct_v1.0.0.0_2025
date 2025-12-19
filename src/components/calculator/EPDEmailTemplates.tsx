/**
 * EPD Email Templates Component
 * UI for generating and using email templates for EPD renewal requests
 */

import { useState } from 'react';
import { Mail, Copy, ExternalLink, FileText, Send, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  MaterialDetails,
  ContactDetails,
  EmailTemplate,
  generateRenewalRequestEmail,
  generateFollowUpEmail,
  generateThankYouEmail,
  generateMailtoLink,
  copyEmailToClipboard,
} from '@/lib/epd-email-templates';
import { SupplierContact } from '@/hooks/useSupplierContacts';

type TemplateType = 'renewal' | 'followup' | 'thankyou';

interface EPDEmailTemplatesProps {
  material?: MaterialDetails;
  contact?: SupplierContact | null;
  projectName?: string;
  originalRequestDate?: string;
  newEpdNumber?: string;
  onEmailSent?: () => void;
}

export function EPDEmailTemplates({
  material,
  contact,
  projectName,
  originalRequestDate,
  newEpdNumber,
  onEmailSent,
}: EPDEmailTemplatesProps) {
  const [templateType, setTemplateType] = useState<TemplateType>('renewal');
  const [senderName, setSenderName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Convert SupplierContact to ContactDetails
  const contactDetails: ContactDetails | null = contact ? {
    companyName: contact.company_name,
    contactName: contact.contact_name,
    email: contact.email,
    phone: contact.phone,
  } : null;

  // Default material if none provided
  const materialDetails: MaterialDetails = material || {
    materialName: 'Sample Material',
    epdNumber: 'EPD-XXXX-XXXX',
    manufacturer: 'Manufacturer Name',
    expiryDate: new Date().toISOString(),
    category: 'Construction Material',
  };

  // Generate email based on template type
  const getEmailTemplate = (): EmailTemplate => {
    switch (templateType) {
      case 'followup':
        return generateFollowUpEmail(
          materialDetails,
          contactDetails,
          originalRequestDate || new Date().toISOString(),
          senderName || undefined
        );
      case 'thankyou':
        return generateThankYouEmail(
          materialDetails,
          contactDetails,
          newEpdNumber,
          senderName || undefined
        );
      case 'renewal':
      default:
        return generateRenewalRequestEmail(
          materialDetails,
          contactDetails,
          projectName,
          senderName || undefined
        );
    }
  };

  const template = getEmailTemplate();

  const handleOpenEmail = () => {
    const mailtoLink = generateMailtoLink(template);
    window.open(mailtoLink, '_blank');
    onEmailSent?.();
    toast.success('Email client opened');
  };

  const handleCopyEmail = async () => {
    const success = await copyEmailToClipboard(template);
    if (success) {
      setCopied(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy email');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="h-4 w-4" />
          Email Templates
        </CardTitle>
        <CardDescription>
          Auto-generated emails for EPD renewal requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Template Type</Label>
            <Select value={templateType} onValueChange={(v) => setTemplateType(v as TemplateType)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renewal">
                  <span className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Renewal Request
                  </span>
                </SelectItem>
                <SelectItem value="followup">
                  <span className="flex items-center gap-2">
                    <Send className="h-3 w-3" />
                    Follow-up
                  </span>
                </SelectItem>
                <SelectItem value="thankyou">
                  <span className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    Thank You
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Your Name (optional)</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Enter your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
        </div>

        {/* Material & Contact Summary */}
        <div className="grid grid-cols-2 gap-3 p-2 bg-muted/50 rounded-md text-xs">
          <div>
            <span className="text-muted-foreground">Material:</span>
            <p className="font-medium truncate">{materialDetails.materialName}</p>
            {materialDetails.epdNumber && (
              <p className="text-muted-foreground">{materialDetails.epdNumber}</p>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Contact:</span>
            <p className="font-medium truncate">{contactDetails?.companyName || 'Not specified'}</p>
            <p className="text-muted-foreground truncate">{contactDetails?.email || 'No email'}</p>
          </div>
        </div>

        {/* Email Preview */}
        <Collapsible open={showPreview} onOpenChange={setShowPreview}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between text-xs">
              Preview Email
              <ChevronDown className={`h-3 w-3 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2 p-3 bg-muted/30 rounded-md border">
              <div className="text-xs">
                <span className="text-muted-foreground">To: </span>
                <span className="font-medium">{template.to || '[Recipient Email]'}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Subject: </span>
                <span className="font-medium">{template.subject}</span>
              </div>
              <Textarea
                readOnly
                className="min-h-[200px] text-xs font-mono resize-none"
                value={template.body}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleOpenEmail}
          >
            <ExternalLink className="h-3 w-3" />
            Open in Email App
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopyEmail}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
