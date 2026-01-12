import { useState } from "react";
import { Mail, Download, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WhitepaperEmailGateProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  source?: string;
}

export const WhitepaperEmailGate = ({ 
  children, 
  variant = "default",
  size = "default",
  className = "",
  source = "unknown"
}: WhitepaperEmailGateProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [open, setOpen] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !isValidEmail(email)) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address to download the whitepaper.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the lead capture
      await supabase.from("analytics_events").insert({
        event_name: "whitepaper_download",
        event_data: { 
          email: email.trim(),
          whitepaper: "the-silent-transfer",
          source: source
        },
        page_url: window.location.href,
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = "/resources/the-silent-transfer-whitepaper.pdf";
      link.download = "The_Silent_Transfer_CarbonConstruct.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setHasDownloaded(true);
      toast({
        title: "Download started!",
        description: "Check your downloads folder for the whitepaper.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAgain = () => {
    const link = document.createElement("a");
    link.href = "/resources/the-silent-transfer-whitepaper.pdf";
    link.download = "The_Silent_Transfer_CarbonConstruct.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {hasDownloaded ? "Download Complete!" : "Download Free Whitepaper"}
          </DialogTitle>
          <DialogDescription>
            {hasDownloaded 
              ? "Thank you for your interest. Check your downloads folder."
              : "Enter your email to receive 'The Silent Transfer' PDF"
            }
          </DialogDescription>
        </DialogHeader>
        
        {hasDownloaded ? (
          <div className="text-center space-y-4 pt-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDownloadAgain}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Again
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDownload} className="space-y-4 pt-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. No spam, ever.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WhitepaperEmailGate;
