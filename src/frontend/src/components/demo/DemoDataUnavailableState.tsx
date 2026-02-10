// Empty state component for Demo/Preview Mode when data is unavailable

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DemoDataUnavailableStateProps {
  message?: string;
}

export default function DemoDataUnavailableState({ message }: DemoDataUnavailableStateProps) {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">Demo Mode</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        {message || 'Data is not available in Demo/Preview Mode. This is a testing environment to explore the interface.'}
      </AlertDescription>
    </Alert>
  );
}
