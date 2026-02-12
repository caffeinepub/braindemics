import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} context={{ queryClient }} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
