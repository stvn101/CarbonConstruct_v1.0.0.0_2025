import { Construction, Mail, Clock } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img 
            src="/logo-96.webp" 
            alt="CarbonConstruct" 
            className="h-16 w-16"
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          CarbonConstruct
        </h1>

        {/* Maintenance Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Construction className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            We're Making Improvements
          </h2>
          <p className="text-muted-foreground text-lg">
            CarbonConstruct is currently undergoing scheduled maintenance to bring you a better experience.
          </p>
        </div>

        {/* ETA */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span>We'll be back shortly</span>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">
            For urgent enquiries, please contact:
          </p>
          <a 
            href="mailto:support@carbonconstruct.com.au" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            support@carbonconstruct.com.au
          </a>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-8">
          © {new Date().getFullYear()} CarbonConstruct. Building a sustainable future for Australian construction.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
