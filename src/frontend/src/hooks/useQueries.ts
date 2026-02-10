import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  School,
  StaffProfile,
  PackingStatus,
  TrainingVisit,
  AcademicQuery,
  AuditLog,
  FilterCriteria,
  UserProfile,
  StaffRole,
  Variant_resolved_open,
  PackingClass,
  PackingTheme,
} from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { isDemoActive, getDemoRole } from '../demo/demoSession';
import { createDemoProfile } from '../demo/demoProfile';
import {
  getDemoSchools,
  saveDemoSchool,
  getDemoSchool,
  getDemoOutstanding,
  setDemoOutstanding,
  hasDemoOutstanding,
  getDemoPackingStatus,
  saveDemoPackingStatus,
  getDemoPackingCount,
  saveDemoPackingCount,
  getDemoPackingCountsBySchool,
} from '../demo/demoDataStore';

// Payment type (not in backend interface, define locally)
export interface Payment {
  id: string;
  schoolId: string;
  amount: bigint;
  dueDate: bigint;
  paid: boolean;
  paymentProof?: ExternalBlob;
  createdTimestamp: bigint;
  lastUpdateTimestamp: bigint;
}

// ============================================================================
// USER PROFILE QUERIES
// ============================================================================

export function getCallerUserProfileQuery() {
  return {
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      // In demo mode, return synthetic profile
      if (isDemoActive()) {
        const demoRole = getDemoRole();
        if (demoRole) {
          return createDemoProfile(demoRole);
        }
        return null;
      }
      
      // Non-demo mode: fetch from backend
      // This will be called by the actor hook
      return null;
    },
    retry: false,
  };
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      // In demo mode, return synthetic profile
      if (isDemoActive()) {
        const demoRole = getDemoRole();
        if (demoRole) {
          return createDemoProfile(demoRole);
        }
        return null;
      }

      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
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
      if (isDemoActive()) {
        throw new Error('Cannot save profile in Demo/Preview Mode');
      }
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
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
    enabled: !!actor && !actorFetching,
  });
}

export function useGetSchool(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School>({
    queryKey: ['school', id],
    queryFn: async () => {
      if (isDemoActive()) {
        const school = getDemoSchool(id);
        if (!school) throw new Error('School not found');
        return school;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getSchool(id);
    },
    enabled: !!actor && !actorFetching && !!id,
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
    }) => {
      if (isDemoActive()) {
        const now = BigInt(Date.now() * 1000000);
        const school: School = {
          ...params,
          website: params.website || undefined,
          createdTimestamp: now,
          lastUpdateTimestamp: now,
        };
        saveDemoSchool(school);
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
        params.studentCount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
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
    }) => {
      if (isDemoActive()) {
        const existing = getDemoSchool(params.id);
        if (!existing) throw new Error('School not found');
        const updated: School = {
          ...existing,
          ...params,
          website: params.website || undefined,
          lastUpdateTimestamp: BigInt(Date.now() * 1000000),
        };
        saveDemoSchool(updated);
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
        params.studentCount
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
    },
  });
}

// ============================================================================
// OUTSTANDING AMOUNT QUERIES
// ============================================================================

export function useGetOutstandingAmount(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['outstanding', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        return getDemoOutstanding(schoolId);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getOutstandingAmount(schoolId);
    },
    enabled: !!actor && !actorFetching && !!schoolId,
  });
}

export function useHasOutstandingAmount(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasOutstanding', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        return hasDemoOutstanding(schoolId);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.hasOutstandingAmount(schoolId);
    },
    enabled: !!actor && !actorFetching && !!schoolId,
  });
}

export function useSetOutstandingAmount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { schoolId: string; amount: bigint }) => {
      if (isDemoActive()) {
        setDemoOutstanding(params.schoolId, params.amount);
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.setOutstandingAmount(params.schoolId, params.amount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['outstanding', variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: ['hasOutstanding', variables.schoolId] });
    },
  });
}

// ============================================================================
// PAYMENT QUERIES (Demo mode only - backend doesn't have payment endpoints yet)
// ============================================================================

export function useListPaymentsBySchool(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: ['payments', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        return [];
      }
      // Backend doesn't have payment endpoints yet
      return [];
    },
    enabled: !!actor && !actorFetching && !!schoolId,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      schoolId: string;
      amount: bigint;
      dueDate: bigint;
    }) => {
      if (isDemoActive()) {
        throw new Error('Cannot create payment in Demo/Preview Mode');
      }
      // Backend doesn't have payment endpoints yet
      throw new Error('Payment creation not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.schoolId] });
    },
  });
}

export function useUpdatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      schoolId: string;
      amount: bigint;
      dueDate: bigint;
      paid: boolean;
    }) => {
      if (isDemoActive()) {
        throw new Error('Cannot update payment in Demo/Preview Mode');
      }
      // Backend doesn't have payment endpoints yet
      throw new Error('Payment update not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.schoolId] });
    },
  });
}

export function useUploadPaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      paymentId: string;
      schoolId: string;
      proof: ExternalBlob;
    }) => {
      if (isDemoActive()) {
        throw new Error('Cannot upload payment proof in Demo/Preview Mode');
      }
      // Backend doesn't have payment endpoints yet
      throw new Error('Payment proof upload not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.schoolId] });
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
        if (!status) {
          // Return default status
          const now = BigInt(Date.now() * 1000000);
          return {
            schoolId,
            kitCount: BigInt(0),
            addOnCount: BigInt(0),
            packed: false,
            dispatched: false,
            dispatchDetails: undefined,
            currentTheme: '',
            createdTimestamp: now,
            lastUpdateTimestamp: now,
          };
        }
        return status;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getPackingStatus(schoolId);
    },
    enabled: !!actor && !actorFetching && !!schoolId,
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
        const now = BigInt(Date.now() * 1000000);
        const existing = getDemoPackingStatus(params.schoolId);
        const status: PackingStatus = {
          schoolId: params.schoolId,
          kitCount: params.kitCount,
          addOnCount: params.addOnCount,
          packed: params.packed,
          dispatched: params.dispatched,
          dispatchDetails: params.dispatchDetails || undefined,
          currentTheme: params.currentTheme,
          createdTimestamp: existing?.createdTimestamp || now,
          lastUpdateTimestamp: now,
        };
        saveDemoPackingStatus(status);
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
    },
  });
}

export function useGetPackingCount(schoolId: string, pClass: PackingClass, theme: PackingTheme) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['packingCount', schoolId, pClass, theme],
    queryFn: async () => {
      if (isDemoActive()) {
        return getDemoPackingCount(schoolId, pClass, theme);
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getPackingCount(schoolId, pClass, theme);
    },
    enabled: !!actor && !actorFetching && !!schoolId,
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
        const now = BigInt(Date.now() * 1000000);
        const existing = getDemoPackingCount(params.schoolId, params.pClass, params.theme);
        const count = {
          classType: params.pClass,
          theme: params.theme,
          totalCount: params.totalCount,
          packedCount: params.packedCount,
          addOnCount: params.addOnCount,
          createdTimestamp: existing?.createdTimestamp || now,
          lastUpdateTimestamp: now,
        };
        saveDemoPackingCount(params.schoolId, count);
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
      queryClient.invalidateQueries({ queryKey: ['packingCount', variables.schoolId, variables.pClass, variables.theme] });
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
      if (isDemoActive()) {
        return [];
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAllStaff();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateStaffProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      principal: Principal;
      fullName: string;
      role: StaffRole;
      department: string;
      contactNumber: string;
      email: string;
    }) => {
      if (isDemoActive()) {
        throw new Error('Cannot create staff in Demo/Preview Mode');
      }
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
      role: StaffRole;
      department: string;
      contactNumber: string;
      email: string;
    }) => {
      if (isDemoActive()) {
        throw new Error('Cannot update staff in Demo/Preview Mode');
      }
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
      if (isDemoActive()) {
        throw new Error('Cannot repair permissions in Demo/Preview Mode');
      }
      if (!actor) throw new Error('Actor not available');
      return actor.repairStaffProfilePermissions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// ============================================================================
// AUDIT LOG QUERIES
// ============================================================================

export function useListAllAuditLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      if (isDemoActive()) {
        return [];
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAllAuditLogs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFilteredAuditLogs(criteria: FilterCriteria) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs', 'filtered', criteria],
    queryFn: async () => {
      if (isDemoActive()) {
        return [];
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getFilteredAuditLogs(criteria);
    },
    enabled: !!actor && !actorFetching,
  });
}

// ============================================================================
// TRAINING QUERIES
// ============================================================================

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
      classroomObservationProof: ExternalBlob | null;
    }) => {
      if (isDemoActive()) {
        throw new Error('Cannot create training visit in Demo/Preview Mode');
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

export function useListTrainingVisitsBySchool(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TrainingVisit[]>({
    queryKey: ['trainingVisits', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        return [];
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listTrainingVisitsBySchool(schoolId);
    },
    enabled: !!actor && !actorFetching && !!schoolId,
  });
}

// ============================================================================
// ACADEMIC QUERIES
// ============================================================================

export function useCreateAcademicQuery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { schoolId: string; queries: string }) => {
      if (isDemoActive()) {
        throw new Error('Cannot create academic query in Demo/Preview Mode');
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
        throw new Error('Cannot respond to academic query in Demo/Preview Mode');
      }
      if (!actor) throw new Error('Actor not available');
      return actor.respondToAcademicQuery(params.id, params.response, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicQueries'] });
    },
  });
}

export function useListAllAcademicQueries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AcademicQuery[]>({
    queryKey: ['academicQueries'],
    queryFn: async () => {
      if (isDemoActive()) {
        return [];
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAllAcademicQueries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useListAcademicQueriesBySchool(schoolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AcademicQuery[]>({
    queryKey: ['academicQueries', schoolId],
    queryFn: async () => {
      if (isDemoActive()) {
        return [];
      }
      if (!actor) throw new Error('Actor not available');
      return actor.listAcademicQueriesBySchool(schoolId);
    },
    enabled: !!actor && !actorFetching && !!schoolId,
  });
}
