import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

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

  handleGoToLogin = () => {
    // Clear error state and navigate
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.href = '/login';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = getErrorMessage(this.state.error);
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
                An unexpected error occurred while loading the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold mb-1">Error Message:</p>
                <p className="text-sm font-mono text-muted-foreground break-words">
                  {errorMessage}
                </p>
              </div>

              {(hasStack || hasComponentStack) && (
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
                      {hasStack && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-semibold mb-1">Stack Trace:</p>
                          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
                            {this.state.error?.stack}
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
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={this.handleGoToLogin} className="w-full">
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
