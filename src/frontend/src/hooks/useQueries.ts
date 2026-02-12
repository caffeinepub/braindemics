import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { isDemoActive } from '../demo/demoSession';
import {
  getDemoSchools,
  createDemoSchool,
  updateDemoSchool,
  getDemoOutstandingAmounts,
  setDemoOutstandingAmount,
  getDemoPackingStatuses,
  createOrUpdateDemoPackingStatus,
  getDemoPackingCounts,
  createOrUpdateDemoPackingCount,
  getDemoTrainingVisits,
  createDemoTrainingVisit,
  updateDemoTrainingVisit,
  getDemoAcademicQueries,
  createDemoAcademicQuery,
  respondToDemoAcademicQuery,
  getDemoPackingStatus,
  getDemoPackingCountsBySchool,
} from '../demo/demoDataStore';
import { canPerformAction } from '../demo/demoGuards';
import type {
  School,
  StaffProfile,
  UserProfile,
  PackingStatus,
  PackingCount,
  TrainingVisit,
  AcademicQuery,
  AuditLog,
  FilterCriteria,
  ConsolidatedSchoolModuleData,
  PackingClass,
  PackingTheme,
  Variant_resolved_open,
  Notification,
} from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ============================================================================
// USER PROFILE QUERIES
// ============================================================================

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (isDemoActive()) {
        return null;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !isDemoActive(),
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ============================================================================
// STAFF MANAGEMENT QUERIES
// ============================================================================

export function useListAllStaff() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StaffProfile[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllStaff();
    },
    enabled: !!actor && !actorFetching && !isDemoActive(),
  });
}

export function useCreateStaffProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      principal: Principal;
      fullName: string;
      role: any;
      department: string;
      contactNumber: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStaffProfile(
        params.principal,
        params.fullName,
        params.role,
        params.department,
        params.contactNumber,
        params.email
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaffProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      principal: Principal;
      fullName: string;
      role: any;
      department: string;
      contactNumber: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaffProfile(
        params.principal,
        params.fullName,
        params.role,
        params.department,
        params.contactNumber,
        params.email
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useRepairStaffPermissions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.repairStaffProfilePermissions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// ============================================================================
// SCHOOL QUERIES
// ============================================================================

export function useListAllSchools() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: async () => {
      if (isDemoActive()) {
        return getDemoSchools();
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAllSchools();
    },
    enabled: isDemoActive() || (!!actor && !actorFetching),
  });
}

export function useGetSchool(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School>({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        const schools = getDemoSchools();
        const school = schools.find((s) => s.id === schoolId);
        if (!school) throw new Error('School not found');
        return school;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getSchool(schoolId);
    },
    enabled: (isDemoActive() || (!!actor && !actorFetching)) && !!schoolId,
  });
}

export function useCreateSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      contactPerson: string;
      contactNumber: string;
      email: string;
      website: string | null;
      studentCount: bigint;
      shippingAddress: string;
      product: string;
    }) => {
      if (isDemoActive()) {
        canPerformAction('createSchool');
        createDemoSchool({
          ...params,
          website: params.website || undefined,
        });
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.createSchool(
        params.id,
        params.name,
        params.address,
        params.city,
        params.state,
        params.contactPerson,
        params.contactNumber,
        params.email,
        params.website,
        params.studentCount,
        params.shippingAddress,
        params.product
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      contactPerson: string;
      contactNumber: string;
      email: string;
      website: string | null;
      studentCount: bigint;
      shippingAddress: string;
      product: string;
    }) => {
      if (isDemoActive()) {
        canPerformAction('updateSchool');
        updateDemoSchool({
          ...params,
          website: params.website || undefined,
        });
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.updateSchool(
        params.id,
        params.name,
        params.address,
        params.city,
        params.state,
        params.contactPerson,
        params.contactNumber,
        params.email,
        params.website,
        params.studentCount,
        params.shippingAddress,
        params.product
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
    },
  });
}

// ============================================================================
// NOTIFICATIONS QUERIES
// ============================================================================

export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (isDemoActive()) {
        return [];
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getNotifications();
    },
    enabled: !!actor && !actorFetching && !isDemoActive(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (isDemoActive()) {
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (isDemoActive()) {
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ============================================================================
// OUTSTANDING AMOUNT QUERIES
// ============================================================================

export function useGetOutstandingAmount(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['outstandingAmount', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        const amounts = getDemoOutstandingAmounts();
        return amounts[schoolId] || BigInt(0);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getOutstandingAmount(schoolId);
    },
    enabled: (isDemoActive() || (!!actor && !actorFetching)) && !!schoolId,
  });
}

export function useGetOutstandingAmountsBySchoolIds(schoolIds: string[]) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, bigint][]>({
    queryKey: ['outstandingAmounts', schoolIds],
    queryFn: async () => {
      if (isDemoActive()) {
        const amounts = getDemoOutstandingAmounts();
        return schoolIds.map((id) => [id, amounts[id] || BigInt(0)] as [string, bigint]);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getOutstandingAmountsBySchoolIds(schoolIds);
    },
    enabled: (isDemoActive() || (!!actor && !actorFetching)) && schoolIds.length > 0,
  });
}

export function useSetOutstandingAmount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { schoolId: string; amount: bigint }) => {
      if (isDemoActive()) {
        canPerformAction('setOutstandingAmount');
        setDemoOutstandingAmount(params.schoolId, params.amount);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.setOutstandingAmount(params.schoolId, params.amount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['outstandingAmount', variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: ['outstandingAmounts'] });
    },
  });
}

// ============================================================================
// PACKING QUERIES
// ============================================================================

export function useGetPackingStatus(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PackingStatus>({
    queryKey: ['packingStatus', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        const status = getDemoPackingStatus(schoolId);
        if (!status) throw new Error('Packing status not found');
        return status;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getPackingStatus(schoolId);
    },
    enabled: (isDemoActive() || (!!actor && !actorFetching)) && !!schoolId,
    retry: false,
  });
}

export function useGetPackingCountsBySchool(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PackingCount[]>({
    queryKey: ['packingCounts', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        const counts = getDemoPackingCountsBySchool(schoolId);
        return counts.filter((c) => c.classType !== undefined);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getPackingCountsBySchool(schoolId);
    },
    enabled: (isDemoActive() || (!!actor && !actorFetching)) && !!schoolId,
  });
}

export function useListAllPackingStatuses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PackingStatus[]>({
    queryKey: ['packingStatuses'],
    queryFn: async () => {
      if (isDemoActive()) {
        return getDemoPackingStatuses();
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAllPackingStatuses();
    },
    enabled: isDemoActive() || (!!actor && !actorFetching),
  });
}

export function useCreateOrUpdatePackingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      schoolId: string;
      kitCount: bigint;
      addOnCount: bigint;
      packed: boolean;
      dispatched: boolean;
      dispatchDetails: string | null;
      currentTheme: string;
    }) => {
      if (isDemoActive()) {
        canPerformAction('updatePackingStatus');
        createOrUpdateDemoPackingStatus(params);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdatePackingStatus(
        params.schoolId,
        params.kitCount,
        params.addOnCount,
        params.packed,
        params.dispatched,
        params.dispatchDetails,
        params.currentTheme
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packingStatus', variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: ['packingStatuses'] });
    },
  });
}

export function useCreateOrUpdatePackingCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      schoolId: string;
      pClass: PackingClass;
      theme: PackingTheme;
      totalCount: bigint;
      packedCount: bigint;
      addOnCount: bigint;
    }) => {
      if (isDemoActive()) {
        canPerformAction('updatePackingCount');
        createOrUpdateDemoPackingCount(params);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdatePackingCount(
        params.schoolId,
        params.pClass,
        params.theme,
        params.totalCount,
        params.packedCount,
        params.addOnCount
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packingCounts', variables.schoolId] });
    },
  });
}

// ============================================================================
// TRAINING QUERIES
// ============================================================================

export function useListTrainingVisitsBySchool(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TrainingVisit[]>({
    queryKey: ['trainingVisits', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        return getDemoTrainingVisits(schoolId);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listTrainingVisitsBySchool(schoolId);
    },
    enabled: (isDemoActive() || (!!actor && !actorFetching)) && !!schoolId,
  });
}

export function useCreateTrainingVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      schoolId: string;
      visitDate: bigint;
      reason: string;
      visitingPerson: string;
      contactPersonMobile: string;
      observations: string;
      classroomObservationProof: any;
    }) => {
      if (isDemoActive()) {
        canPerformAction('createTrainingVisit');
        return createDemoTrainingVisit(params);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.createTrainingVisit(
        params.schoolId,
        params.visitDate,
        params.reason,
        params.visitingPerson,
        params.contactPersonMobile,
        params.observations,
        params.classroomObservationProof
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainingVisits', variables.schoolId] });
    },
  });
}

export function useUpdateTrainingVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      schoolId: string;
      visitDate: bigint;
      reason: string;
      visitingPerson: string;
      contactPersonMobile: string;
      observations: string;
      classroomObservationProof: any;
    }) => {
      if (isDemoActive()) {
        canPerformAction('updateTrainingVisit');
        updateDemoTrainingVisit(params);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.updateTrainingVisit(
        params.id,
        params.schoolId,
        params.visitDate,
        params.reason,
        params.visitingPerson,
        params.contactPersonMobile,
        params.observations,
        params.classroomObservationProof
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainingVisits', variables.schoolId] });
    },
  });
}

// ============================================================================
// ACADEMIC QUERIES
// ============================================================================

export function useListAllAcademicQueries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AcademicQuery[]>({
    queryKey: ['academicQueries'],
    queryFn: async () => {
      if (isDemoActive()) {
        return getDemoAcademicQueries();
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAllAcademicQueries();
    },
    enabled: isDemoActive() || (!!actor && !actorFetching),
  });
}

export function useListAcademicQueriesBySchool(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AcademicQuery[]>({
    queryKey: ['academicQueries', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        const queries = getDemoAcademicQueries();
        return queries.filter((q) => q.schoolId === schoolId);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAcademicQueriesBySchool(schoolId);
    },
    enabled: (isDemoActive() || (!!actor && !actorFetching)) && !!schoolId,
  });
}

export function useCreateAcademicQuery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { schoolId: string; queries: string }) => {
      if (isDemoActive()) {
        canPerformAction('createAcademicQuery');
        return createDemoAcademicQuery(params);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.createAcademicQuery(params.schoolId, params.queries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicQueries'] });
    },
  });
}

export function useRespondToAcademicQuery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; response: string; status: Variant_resolved_open }) => {
      if (isDemoActive()) {
        canPerformAction('respondToAcademicQuery');
        respondToDemoAcademicQuery(params);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.respondToAcademicQuery(params.id, params.response, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicQueries'] });
    },
  });
}

// ============================================================================
// AUDIT LOG QUERIES (Admin only, no demo support)
// ============================================================================

export function useListAllAuditLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllAuditLogs();
    },
    enabled: !!actor && !actorFetching && !isDemoActive(),
  });
}

export function useGetFilteredAuditLogs(criteria: FilterCriteria) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs', 'filtered', criteria],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getFilteredAuditLogs(criteria);
    },
    enabled: !!actor && !actorFetching && !isDemoActive(),
  });
}

// ============================================================================
// CONSOLIDATED SCHOOL DETAILS (Admin only, no demo support)
// ============================================================================

export function useGetConsolidatedSchoolDetails(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ConsolidatedSchoolModuleData | null>({
    queryKey: ['consolidatedSchoolDetails', schoolId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getConsolidatedSchoolDetails(schoolId);
    },
    enabled: !!actor && !actorFetching && !!schoolId && !isDemoActive(),
  });
}
