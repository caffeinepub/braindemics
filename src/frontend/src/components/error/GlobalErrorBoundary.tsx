import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global error caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = '/';
  };

  handleGoToLogin = () => {
    window.location.href = '/login';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unknown error occurred';
    
    const message = error.message || 'An error occurred';
    
    // Handle React minified errors
    if (message.includes('Minified React error')) {
      const errorCode = message.match(/#(\d+)/)?.[1];
      switch (errorCode) {
        case '185':
          return 'Invalid React hook usage detected. Hooks must be called at the top level of React components. Please reload the page.';
        case '321':
          return 'Maximum update depth exceeded. The application encountered an infinite loop. Please reload the page.';
        case '418':
          return 'React context provider is missing. Please reload the page.';
        case '425':
          return 'React rendering error. Please reload the page.';
        default:
          return `A React error occurred${errorCode ? ` (code #${errorCode})` : ''}. Please reload the page and try again.`;
      }
    }
    
    // Handle "Invalid hook call"
    if (message.includes('Invalid hook call')) {
      return 'Invalid React hook usage detected. Hooks must be called at the top level of React components. Please reload the page.';
    }
    
    // Handle "Maximum update depth exceeded"
    if (message.includes('Maximum update depth exceeded')) {
      return 'The application encountered an infinite loop. Please reload the page to continue.';
    }
    
    // Handle BigInt serialization errors
    if (message.includes('Do not know how to serialize a BigInt')) {
      return 'Failed to process the request. Please try again.';
    }
    
    return message;
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage(this.state.error);
      const errorName = this.state.error?.name || 'Error';
      const rawMessage = this.state.error?.message || '';
      const hasStack = this.state.error?.stack;
      const hasComponentStack = this.state.errorInfo?.componentStack;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong!</CardTitle>
              </div>
              <CardDescription>
                The application encountered an unexpected error. Please try reloading the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold mb-1">Error Message:</p>
                <p className="text-sm font-mono text-muted-foreground break-words">
                  {errorMessage}
                </p>
              </div>

              {(hasStack || hasComponentStack || rawMessage) && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="w-full justify-between"
                  >
                    <span>Technical Details</span>
                    {this.state.showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {this.state.showDetails && (
                    <div className="mt-2 space-y-3">
                      {rawMessage && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-semibold mb-1">Raw Error:</p>
                          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
                            {errorName}: {rawMessage}
                          </pre>
                        </div>
                      )}

                      {hasComponentStack && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-semibold mb-1">Component Stack:</p>
                          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
                            {this.state.errorInfo?.componentStack}
                          </pre>
                        </div>
                      )}

                      {hasStack && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-semibold mb-1">Stack Trace:</p>
                          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
                            {this.state.error?.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReload} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoToLogin} variant="outline" className="flex-1">
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
