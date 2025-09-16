import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Warning, ArrowClockwise } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AI Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSparkError = this.state.error?.message?.includes('Spark') ||
                          this.state.error?.message?.includes('AI') ||
                          this.state.error?.message?.includes('llm');

      return (
        <Card className="border-visible border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Warning className="w-5 h-5" />
              {isSparkError ? 'AI Service Error' : 'Component Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Warning className="w-4 h-4" />
              <AlertDescription>
                {isSparkError 
                  ? 'There was an issue with the AI services. This might be a temporary connectivity issue.'
                  : 'Something went wrong with this component. Please try refreshing or contact support.'
                }
              </AlertDescription>
            </Alert>

            {isSparkError && (
              <div className="text-sm space-y-2">
                <p className="font-medium">Common solutions:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Refresh the page to reinitialize AI services</li>
                  <li>Check your internet connection</li>
                  <li>Use the "Test AI" button to verify connectivity</li>
                  <li>Try again in a few moments</li>
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={this.handleRetry}
              >
                Try Again
              </Button>
              
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={this.handleRefresh}
              >
                <ArrowClockwise className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-2 bg-muted rounded text-xs">
                <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}