import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global error caught:', error, errorInfo);
  }

  handleGoToLogin = () => {
    // Clear error state and navigate
    this.setState({ hasError: false, error: null });
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred while loading the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-mono text-muted-foreground break-words">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>
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
