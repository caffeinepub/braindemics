import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
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
import MarketingSchoolsPage from './pages/marketing/MarketingSchoolsPage';
import MarketingQueriesPage from './pages/marketing/MarketingQueriesPage';
import SchoolDetailsPage from './pages/schools/SchoolDetailsPage';
import AccountsSchoolsPage from './pages/accounts/AccountsSchoolsPage';
import AccountsQueriesPage from './pages/accounts/AccountsQueriesPage';
import SchoolPaymentsPage from './pages/accounts/SchoolPaymentsPage';
import PackingSchoolsPage from './pages/packing/PackingSchoolsPage';
import SchoolPackingPage from './pages/packing/SchoolPackingPage';
import PackingDispatchHistoryPage from './pages/packing/PackingDispatchHistoryPage';
import PackingQueriesPage from './pages/packing/PackingQueriesPage';
import SchoolTrainingPage from './pages/training/SchoolTrainingPage';
import TrainingQueriesPage from './pages/training/TrainingQueriesPage';
import TrainingPackingDetailsPage from './pages/training/TrainingPackingDetailsPage';
import AcademicQueriesPage from './pages/academic/AcademicQueriesPage';
import AcademicPackingStatusPage from './pages/academic/AcademicPackingStatusPage';
import IndexGatePage from './pages/IndexGatePage';
import { isDemoActive, getDemoRole } from './demo/demoSession';
import { createDemoProfile } from './demo/demoProfile';

interface RouterContext {
  queryClient: QueryClient;
}

interface AuthenticatedContext extends RouterContext {
  profile?: any;
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
  beforeLoad: async () => {
    // Only handle demo mode routing in beforeLoad
    if (isDemoActive()) {
      const demoRole = getDemoRole();
      if (demoRole) {
        const demoProfile = createDemoProfile(demoRole);
        return { profile: demoProfile };
      }
    }
    
    // For non-demo mode, let AppLayout handle auth checks
    return {};
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexGatePage,
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

const marketingSchoolsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketing/schools',
  component: MarketingSchoolsPage,
});

const marketingQueriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketing/queries',
  component: MarketingQueriesPage,
});

const marketingSchoolCreateRoute = createRoute({
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

const accountsSchoolsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/accounts/schools',
  component: AccountsSchoolsPage,
});

const accountsQueriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/accounts/queries',
  component: AccountsQueriesPage,
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

const packingDispatchHistoryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/packing/dispatch-history',
  component: PackingDispatchHistoryPage,
});

const packingQueriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/packing/queries',
  component: PackingQueriesPage,
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

const trainingPackingDetailsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/training/packing-details',
  component: TrainingPackingDetailsPage,
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

const academicPackingStatusRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/academic/packing-status',
  component: AcademicPackingStatusPage,
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
    marketingSchoolsRoute,
    marketingQueriesRoute,
    marketingSchoolCreateRoute,
    accountsDashboardRoute,
    accountsSchoolsRoute,
    accountsQueriesRoute,
    schoolPaymentsRoute,
    packingDashboardRoute,
    packingSchoolsRoute,
    schoolPackingRoute,
    packingDispatchHistoryRoute,
    packingQueriesRoute,
    trainingDashboardRoute,
    schoolTrainingRoute,
    trainingQueriesRoute,
    trainingPackingDetailsRoute,
    academicDashboardRoute,
    academicQueriesRoute,
    academicPackingStatusRoute,
    schoolDetailsRoute,
  ]),
]);
