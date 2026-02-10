import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  School,
  StaffProfile,
  Payment,
  PackingStatus,
  TrainingVisit,
  AcademicQuery,
  AuditLog,
  FilterCriteria,
  UserProfile,
  StaffRole,
  Variant_resolved_open,
} from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// Store actor globally for query options
if (typeof window !== 'undefined') {
  (window as any).__actor__ = null;
}

// User Profile Queries
export const getCallerUserProfileQuery = () =>
  queryOptions({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const actor = (window as any).__actor__;
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    retry: false,
  });

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  // Store actor globally
  if (actor && typeof window !== 'undefined') {
    (window as any).__actor__ = actor;
  }

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
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

// Staff Management
export function useListAllStaff() {
  const { actor, isFetching } = useActor();

  return useQuery<StaffProfile[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllStaff();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStaffProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      principal: Principal;
      fullName: string;
      role: StaffRole;
      department: string;
      contactNumber: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStaffProfile(
        data.principal,
        data.fullName,
        data.role,
        data.department,
        data.contactNumber,
        data.email
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
    mutationFn: async (data: {
      principal: Principal;
      fullName: string;
      role: StaffRole;
      department: string;
      contactNumber: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaffProfile(
        data.principal,
        data.fullName,
        data.role,
        data.department,
        data.contactNumber,
        data.email
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// School Management
export function useListAllSchools() {
  const { actor, isFetching } = useActor();

  return useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllSchools();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSchool(schoolId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<School>({
    queryKey: ['schools', schoolId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSchool(schoolId);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useCreateSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
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
      if (!actor) throw new Error('Actor not available');
      return actor.createSchool(
        data.id,
        data.name,
        data.address,
        data.city,
        data.state,
        data.contactPerson,
        data.contactNumber,
        data.email,
        data.website,
        data.studentCount
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
    mutationFn: async (data: {
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateSchool(
        data.id,
        data.name,
        data.address,
        data.city,
        data.state,
        data.contactPerson,
        data.contactNumber,
        data.email,
        data.website,
        data.studentCount
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools', variables.id] });
    },
  });
}

// Payment Management
export function useListPaymentsBySchool(schoolId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: ['payments', schoolId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPaymentsBySchool(schoolId);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { schoolId: string; amount: bigint; dueDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPayment(data.schoolId, data.amount, data.dueDate);
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
    mutationFn: async (data: { id: string; amount: bigint; dueDate: bigint; paid: boolean; schoolId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePayment(data.id, data.amount, data.dueDate, data.paid);
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
    mutationFn: async (data: { paymentId: string; proof: ExternalBlob; schoolId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadPaymentProof(data.paymentId, data.proof);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.schoolId] });
    },
  });
}

// Packing Management
export function useGetPackingStatus(schoolId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PackingStatus>({
    queryKey: ['packingStatus', schoolId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPackingStatus(schoolId);
    },
    enabled: !!actor && !isFetching && !!schoolId,
    retry: false,
  });
}

export function useListAllPackingStatuses() {
  const { actor, isFetching } = useActor();

  return useQuery<PackingStatus[]>({
    queryKey: ['packingStatuses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllPackingStatuses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrUpdatePackingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      schoolId: string;
      kitCount: bigint;
      addOnCount: bigint;
      packed: boolean;
      dispatched: boolean;
      dispatchDetails: string | null;
      currentTheme: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdatePackingStatus(
        data.schoolId,
        data.kitCount,
        data.addOnCount,
        data.packed,
        data.dispatched,
        data.dispatchDetails,
        data.currentTheme
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packingStatus', variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: ['packingStatuses'] });
    },
  });
}

// Training Visits
export function useListTrainingVisitsBySchool(schoolId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<TrainingVisit[]>({
    queryKey: ['trainingVisits', schoolId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTrainingVisitsBySchool(schoolId);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useCreateTrainingVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      schoolId: string;
      visitDate: bigint;
      reason: string;
      visitingPerson: string;
      contactPersonMobile: string;
      observations: string;
      classroomObservationProof: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTrainingVisit(
        data.schoolId,
        data.visitDate,
        data.reason,
        data.visitingPerson,
        data.contactPersonMobile,
        data.observations,
        data.classroomObservationProof
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainingVisits', variables.schoolId] });
    },
  });
}

// Academic Queries
export function useListAllAcademicQueries() {
  const { actor, isFetching } = useActor();

  return useQuery<AcademicQuery[]>({
    queryKey: ['academicQueries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllAcademicQueries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAcademicQueriesBySchool(schoolId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AcademicQuery[]>({
    queryKey: ['academicQueries', schoolId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAcademicQueriesBySchool(schoolId);
    },
    enabled: !!actor && !isFetching && !!schoolId,
  });
}

export function useCreateAcademicQuery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { schoolId: string; queries: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAcademicQuery(data.schoolId, data.queries);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academicQueries'] });
      queryClient.invalidateQueries({ queryKey: ['academicQueries', variables.schoolId] });
    },
  });
}

export function useRespondToAcademicQuery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; response: string; status: Variant_resolved_open }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.respondToAcademicQuery(data.id, data.response, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicQueries'] });
    },
  });
}

// Audit Logs
export function useListAllAuditLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllAuditLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFilteredAuditLogs(criteria: FilterCriteria) {
  const { actor, isFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs', 'filtered', criteria],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFilteredAuditLogs(criteria);
    },
    enabled: !!actor && !isFetching,
  });
}
