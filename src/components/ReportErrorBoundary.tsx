import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ReportErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ReportErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.inline) {
        return (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {this.props.fallbackTitle || 'Unable to load this section'}
              {this.state.error && (
                <span className="block text-xs mt-1 opacity-70">
                  {this.state.error.message}
                </span>
              )}
            </AlertDescription>
          </Alert>
        );
      }

      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>{this.props.fallbackTitle || 'Error Loading Section'}</CardTitle>
            </div>
            <CardDescription>
              This section couldn't be loaded. The rest of your report is still available.
            </CardDescription>
          </CardHeader>
          {this.state.error && (
            <CardContent>
              <div className="bg-muted p-3 rounded text-xs font-mono text-muted-foreground">
                {this.state.error.message}
              </div>
            </CardContent>
          )}
        </Card>
      );
    }

    return this.props.children;
  }
}
