import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, Copy, CheckCircle } from 'lucide-react';
import { trackError } from '@/lib/analytics';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Track error in analytics with enhanced context
    trackError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      severity: 'critical',
      metadata: {
        errorId: this.state.errorId,
        fallbackTitle: this.props.fallbackTitle,
        route: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false,
    });
  };

  handleCopyError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorDetails = `
Error ID: ${errorId}
Timestamp: ${new Date().toISOString()}
Route: ${window.location.pathname}
User Agent: ${navigator.userAgent}

Error Message:
${error?.message}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      toast.success('Error details copied to clipboard');
      
      setTimeout(() => {
        this.setState({ copied: false });
      }, 3000);
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-2xl w-full border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {this.props.fallbackTitle || 'Something went wrong'}
                  </CardTitle>
                  <CardDescription>
                    We've automatically logged this error and are working to fix it
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error ID Badge */}
              {this.state.errorId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                  <span className="font-medium">Error ID:</span>
                  <code className="font-mono">{this.state.errorId}</code>
                </div>
              )}

              {/* Error Message */}
              {this.state.error && (
                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                  <p className="text-sm font-mono text-foreground/90">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                {this.props.showHomeButton && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={this.handleCopyError}
                  className="gap-2"
                >
                  {this.state.copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Error Details
                    </>
                  )}
                </Button>
              </div>

              {/* Helpful Message */}
              <div className="bg-muted/30 border border-border/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">What you can do:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Try refreshing the page or clicking "Try Again"</li>
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache and reload</li>
                  <li>If the issue persists, copy the error details and contact support</li>
                </ul>
              </div>

              {/* Technical Details */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Show Technical Details
                </summary>
                <div className="mt-3 space-y-3">
                  {this.state.error?.stack && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Stack Trace:</p>
                      <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto max-h-48 border border-border/50">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Component Stack:</p>
                      <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto max-h-48 border border-border/50">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
