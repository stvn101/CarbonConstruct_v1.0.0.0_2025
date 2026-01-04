/**
 * EC3 Attribution Badge Component
 * 
 * REQUIRED by EC3/BuildingTransparency data licensing (CC BY 4.0).
 * Must be displayed whenever EC3 data is shown in the application.
 * 
 * @see https://www.buildingtransparency.org/ec3-resources/buildingtransparency-apis-terms-service/
 */

import { ExternalLink } from "lucide-react";

interface EC3AttributionProps {
  variant?: 'badge' | 'inline' | 'footer';
  className?: string;
}

export function EC3Attribution({ variant = 'badge', className = '' }: EC3AttributionProps) {
  const baseUrl = 'https://buildingtransparency.org';
  
  if (variant === 'inline') {
    return (
      <span className={`text-xs text-muted-foreground ${className}`}>
        Data from{' '}
        <a 
          href={baseUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          EC3
        </a>
        {' '}by Building Transparency
      </span>
    );
  }
  
  if (variant === 'footer') {
    return (
      <div className={`text-xs text-muted-foreground text-center py-2 border-t ${className}`}>
        Material data sourced from the{' '}
        <a 
          href={baseUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          Embodied Carbon in Construction Calculator (EC3)
        </a>
        {' '}by Building Transparency. Licensed under CC BY 4.0.
      </div>
    );
  }
  
  // Default: badge variant
  return (
    <a
      href={baseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors ${className}`}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="h-3.5 w-3.5"
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      <span>Powered by EC3</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

/**
 * EC3 Material Link - links to the original EPD in EC3
 */
interface EC3MaterialLinkProps {
  ec3Id: string;
  ec3Url?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EC3MaterialLink({ ec3Id, ec3Url, className = '', children }: EC3MaterialLinkProps) {
  const url = ec3Url || `https://buildingtransparency.org/ec3/epds/${ec3Id}`;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline ${className}`}
    >
      {children || 'View in EC3'}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
