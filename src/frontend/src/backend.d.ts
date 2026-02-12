import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PackingCount {
    theme: PackingTheme;
    addOnCount: bigint;
    totalCount: bigint;
    lastUpdateTimestamp: bigint;
    createdTimestamp: bigint;
    classType: PackingClass;
    packedCount: bigint;
}
export interface SectionMetadata {
    section: string;
    lastUpdatedBy?: Principal;
    lastUpdatedTimestamp?: bigint;
    lastUpdatedByName: string;
}
export interface AuditLog {
    id: string;
    action: string;
    initiator: Principal;
    entityId: string;
    timestamp: bigint;
    details: string;
    entityType: string;
}
export interface StaffProfile {
    principal: Principal;
    role: StaffRole;
    fullName: string;
    email: string;
    createdTimestamp: bigint;
    contactNumber: string;
    department: string;
}
export interface FilterCriteria {
    filterEntityType?: string;
    filterDateRange?: [bigint, bigint];
    filterEntityId?: string;
    filterInitiator?: Principal;
}
export interface AcademicQueryExtended {
    id: string;
    status: Variant_resolved_open;
    lastUpdateTimestamp: bigint;
    schoolId: string;
    queries: string;
    response?: string;
    lastUpdatedByName: string;
    createdTimestamp: bigint;
    raisedBy: Principal;
}
export interface AcademicQuery {
    id: string;
    status: Variant_resolved_open;
    lastUpdateTimestamp: bigint;
    schoolId: string;
    queries: string;
    response?: string;
    createdTimestamp: bigint;
    raisedBy: Principal;
}
export interface TrainingVisit {
    id: string;
    visitingPerson: string;
    contactPersonMobile: string;
    visitDate: bigint;
    schoolId: string;
    createdTimestamp: bigint;
    classroomObservationProof?: ExternalBlob;
    observations: string;
    reason: string;
}
export interface PackingStatus {
    kitCount: bigint;
    addOnCount: bigint;
    currentTheme: string;
    dispatched: boolean;
    dispatchDetails?: string;
    lastUpdateTimestamp: bigint;
    schoolId: string;
    createdTimestamp: bigint;
    packed: boolean;
}
export interface Notification {
    id: string;
    content: string;
    isRead: boolean;
    timestamp: bigint;
}
export interface School {
    id: string;
    city: string;
    name: string;
    contactPerson: string;
    email: string;
    website?: string;
    state: string;
    lastUpdateTimestamp: bigint;
    address: string;
    createdTimestamp: bigint;
    shippingAddress: string;
    contactNumber: string;
    studentCount: bigint;
    product: string;
}
export interface ConsolidatedSchoolModuleData {
    school: School;
    packingCounts: Array<PackingCount>;
    sectionMetadata: Array<SectionMetadata>;
    academicQueries: Array<AcademicQuery>;
    trainingVisits: Array<TrainingVisit>;
    outstandingAmount: bigint;
    packingStatus?: PackingStatus;
    lastActionByModule: Array<[string, Principal | null, string, bigint | null]>;
}
export interface UserProfile {
    role: StaffRole;
    fullName: string;
    email: string;
    contactNumber: string;
    department: string;
}
export enum PackingClass {
    class1 = "class1",
    class2 = "class2",
    class3 = "class3",
    class4 = "class4",
    class5 = "class5",
    preSchool = "preSchool"
}
export enum PackingTheme {
    themeA = "themeA",
    themeB = "themeB",
    themeC = "themeC",
    themeD = "themeD",
    themeE = "themeE"
}
export enum StaffRole {
    admin = "admin",
    marketing = "marketing",
    packing = "packing",
    academic = "academic",
    accounts = "accounts",
    training = "training"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_resolved_open {
    resolved = "resolved",
    open = "open"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAcademicQuery(schoolId: string, queries: string): Promise<string>;
    createOrUpdatePackingCount(schoolId: string, pClass: PackingClass, theme: PackingTheme, totalCount: bigint, packedCount: bigint, addOnCount: bigint): Promise<void>;
    createOrUpdatePackingStatus(schoolId: string, kitCount: bigint, addOnCount: bigint, packed: boolean, dispatched: boolean, dispatchDetails: string | null, currentTheme: string): Promise<void>;
    createSchool(id: string, name: string, address: string, city: string, state: string, contactPerson: string, contactNumber: string, email: string, website: string | null, studentCount: bigint, shippingAddress: string, product: string): Promise<void>;
    createStaffProfile(principal: Principal, fullName: string, role: StaffRole, department: string, contactNumber: string, email: string): Promise<void>;
    createTrainingVisit(schoolId: string, visitDate: bigint, reason: string, visitingPerson: string, contactPersonMobile: string, observations: string, classroomObservationProof: ExternalBlob | null): Promise<string>;
    getAcademicQueriesBySchoolWithMetadata(schoolId: string): Promise<Array<AcademicQueryExtended>>;
    getAcademicQuery(id: string): Promise<AcademicQuery>;
    getAuditLog(entryId: string): Promise<AuditLog>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConsolidatedSchoolDetails(schoolId: string): Promise<ConsolidatedSchoolModuleData | null>;
    getFilteredAuditLogs(criteria: FilterCriteria): Promise<Array<AuditLog>>;
    getNotifications(): Promise<Array<Notification>>;
    getOutstandingAmount(schoolId: string): Promise<bigint>;
    getOutstandingAmountsBySchoolIds(schoolIds: Array<string>): Promise<Array<[string, bigint]>>;
    getPackingCount(schoolId: string, pClass: PackingClass, theme: PackingTheme): Promise<PackingCount>;
    getPackingCountsBySchool(schoolId: string): Promise<Array<PackingCount>>;
    getPackingStatus(schoolId: string): Promise<PackingStatus>;
    getSchool(id: string): Promise<School>;
    getStaffProfile(principal: Principal): Promise<StaffProfile>;
    getTrainingVisit(id: string): Promise<TrainingVisit>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasOutstandingAmount(schoolId: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAcademicQueriesBySchool(schoolId: string): Promise<Array<AcademicQuery>>;
    listAllAcademicQueries(): Promise<Array<AcademicQuery>>;
    listAllAuditLogs(): Promise<Array<AuditLog>>;
    listAllPackingStatuses(): Promise<Array<PackingStatus>>;
    listAllSchools(): Promise<Array<School>>;
    listAllStaff(): Promise<Array<StaffProfile>>;
    listTrainingVisitsBySchool(schoolId: string): Promise<Array<TrainingVisit>>;
    markAllNotificationsAsRead(): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    repairStaffProfilePermissions(): Promise<bigint>;
    respondToAcademicQuery(id: string, response: string, status: Variant_resolved_open): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setOutstandingAmount(schoolId: string, amount: bigint): Promise<void>;
    updateSchool(id: string, name: string, address: string, city: string, state: string, contactPerson: string, contactNumber: string, email: string, website: string | null, studentCount: bigint, shippingAddress: string, product: string): Promise<void>;
    updateStaffProfile(principal: Principal, fullName: string, role: StaffRole, department: string, contactNumber: string, email: string): Promise<void>;
    updateTrainingVisit(id: string, schoolId: string, visitDate: bigint, reason: string, visitingPerson: string, contactPersonMobile: string, observations: string, classroomObservationProof: ExternalBlob | null): Promise<void>;
}
