import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/layout/AppLayout';
import AdminDashboardPage from './pages/dashboards/AdminDashboardPage';
import MarketingDashboardPage from './pages/dashboards/MarketingDashboardPage';
import AccountsDashboardPage from './pages/dashboards/AccountsDashboardPage';
import PackingDashboardPage from './pages/dashboards/PackingDashboardPage';
import TrainingDashboardPage from './pages/dashboards/TrainingDashboardPage';
import AcademicDashboardPage from './pages/dashboards/AcademicDashboardPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import OutstandingAmountPage from './pages/admin/OutstandingAmountPage';
import AdminSchoolDetailsPage from './pages/admin/AdminSchoolDetailsPage';
import SchoolCreatePage from './pages/marketing/SchoolCreatePage';
import SchoolDetailsPage from './pages/schools/SchoolDetailsPage';
import SchoolPaymentsPage from './pages/accounts/SchoolPaymentsPage';
import PackingSchoolsPage from './pages/packing/PackingSchoolsPage';
import SchoolPackingPage from './pages/packing/SchoolPackingPage';
import SchoolTrainingPage from './pages/training/SchoolTrainingPage';
import TrainingQueriesPage from './pages/training/TrainingQueriesPage';
import AcademicQueriesPage from './pages/academic/AcademicQueriesPage';
import { getCallerUserProfileQuery } from './hooks/useQueries';
import { isDemoActive, getDemoRole } from './demo/demoSession';
import { createDemoProfile } from './demo/demoProfile';
import { getDashboardRoute } from './demo/demoRoutes';

interface RouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AppLayout,
  beforeLoad: async ({ context }) => {
    // Check for demo mode first
    if (isDemoActive()) {
      const demoRole = getDemoRole();
      if (demoRole) {
        const demoProfile = createDemoProfile(demoRole);
        return { profile: demoProfile };
      }
    }
    
    // Non-demo mode: require backend profile
    const queryClient = (context as RouterContext).queryClient;
    const profile = await queryClient.ensureQueryData(getCallerUserProfileQuery());
    
    if (!profile) {
      throw redirect({ to: '/login' });
    }
    
    return { profile };
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async ({ context }) => {
    // Check for demo mode first
    if (isDemoActive()) {
      const demoRole = getDemoRole();
      if (demoRole) {
        throw redirect({ to: getDashboardRoute(demoRole) });
      }
    }
    
    // Non-demo mode: require backend profile
    const queryClient = (context as RouterContext).queryClient;
    const profile = await queryClient.ensureQueryData(getCallerUserProfileQuery());
    
    if (!profile) {
      throw redirect({ to: '/login' });
    }
    
    const roleRoutes = {
      admin: '/admin/dashboard',
      marketing: '/marketing/dashboard',
      accounts: '/accounts/dashboard',
      packing: '/packing/dashboard',
      training: '/training/dashboard',
      academic: '/academic/dashboard',
    };
    
    throw redirect({ to: roleRoutes[profile.role] || '/login' });
  },
});

// Admin routes
const adminDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/dashboard',
  component: AdminDashboardPage,
});

const staffManagementRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/staff',
  component: StaffManagementPage,
});

const auditLogRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/audit',
  component: AuditLogPage,
});

const outstandingAmountRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/outstanding',
  component: OutstandingAmountPage,
});

const adminSchoolDetailsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin/schools/$schoolId',
  component: AdminSchoolDetailsPage,
});

// Marketing routes
const marketingDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketing/dashboard',
  component: MarketingDashboardPage,
});

const schoolCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketing/schools/create',
  component: SchoolCreatePage,
});

// Accounts routes
const accountsDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/accounts/dashboard',
  component: AccountsDashboardPage,
});

const schoolPaymentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/accounts/schools/$schoolId/payments',
  component: SchoolPaymentsPage,
});

// Packing routes
const packingDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/packing/dashboard',
  component: PackingDashboardPage,
});

const packingSchoolsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/packing/schools',
  component: PackingSchoolsPage,
});

const schoolPackingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/packing/schools/$schoolId',
  component: SchoolPackingPage,
});

// Training routes
const trainingDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/training/dashboard',
  component: TrainingDashboardPage,
});

const schoolTrainingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/training/schools/$schoolId',
  component: SchoolTrainingPage,
});

const trainingQueriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/training/queries',
  component: TrainingQueriesPage,
});

// Academic routes
const academicDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/academic/dashboard',
  component: AcademicDashboardPage,
});

const academicQueriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/academic/queries',
  component: AcademicQueriesPage,
});

// Shared school details route
const schoolDetailsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/schools/$schoolId',
  component: SchoolDetailsPage,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  authenticatedRoute.addChildren([
    adminDashboardRoute,
    staffManagementRoute,
    auditLogRoute,
    outstandingAmountRoute,
    adminSchoolDetailsRoute,
    marketingDashboardRoute,
    schoolCreateRoute,
    accountsDashboardRoute,
    schoolPaymentsRoute,
    packingDashboardRoute,
    packingSchoolsRoute,
    schoolPackingRoute,
    trainingDashboardRoute,
    schoolTrainingRoute,
    trainingQueriesRoute,
    academicDashboardRoute,
    academicQueriesRoute,
    schoolDetailsRoute,
  ]),
]);
