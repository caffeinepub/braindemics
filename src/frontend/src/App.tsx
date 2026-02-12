import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';
import { useMemo } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter<typeof routeTree>>;
  }
}

export default function App() {
  // Create router inside component to ensure QueryClient is available
  const router = useMemo(
    () =>
      createRouter({
        routeTree,
        context: {
          queryClient,
        },
        defaultPreload: 'intent',
      }),
    []
  );

  return (
    <GlobalErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
