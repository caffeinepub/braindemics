// Demo/Preview Mode local data persistence
// Stores schools, outstanding amounts, packing status, counts, training visits, and academic queries in localStorage

import type { School, PackingStatus, PackingClass, PackingTheme, TrainingVisit, AcademicQuery, Variant_resolved_open } from '../backend';

const DEMO_SCHOOLS_KEY = 'braindemics_demo_schools';
const DEMO_OUTSTANDING_KEY = 'braindemics_demo_outstanding';
const DEMO_PACKING_STATUS_KEY = 'braindemics_demo_packing_status';
const DEMO_PACKING_COUNTS_KEY = 'braindemics_demo_packing_counts';
const DEMO_TRAINING_VISITS_KEY = 'braindemics_demo_training_visits';
const DEMO_ACADEMIC_QUERIES_KEY = 'braindemics_demo_academic_queries';
const DEMO_DATA_RESET_FLAG_KEY = 'braindemics_demo_data_reset';

// Track if demo data was corrupted and reset
let dataWasReset = false;

export function wasDataReset(): boolean {
  return dataWasReset;
}

export function clearDataResetFlag(): void {
  dataWasReset = false;
  try {
    localStorage.removeItem(DEMO_DATA_RESET_FLAG_KEY);
  } catch {
    // Ignore
  }
}

function markDataAsReset(): void {
  dataWasReset = true;
  try {
    localStorage.setItem(DEMO_DATA_RESET_FLAG_KEY, 'true');
  } catch {
    // Ignore
  }
}

// ============================================================================
// SCHOOLS
// ============================================================================

interface StoredSchool {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  website?: string;
  studentCount: string; // stored as string
  createdTimestamp: string; // stored as string
  lastUpdateTimestamp: string; // stored as string
}

function schoolToStored(school: School): StoredSchool {
  return {
    id: school.id,
    name: school.name,
    address: school.address,
    city: school.city,
    state: school.state,
    contactPerson: school.contactPerson,
    contactNumber: school.contactNumber,
    email: school.email,
    website: school.website,
    studentCount: school.studentCount.toString(),
    createdTimestamp: school.createdTimestamp.toString(),
    lastUpdateTimestamp: school.lastUpdateTimestamp.toString(),
  };
}

function storedToSchool(stored: StoredSchool): School {
  return {
    id: stored.id,
    name: stored.name,
    address: stored.address,
    city: stored.city,
    state: stored.state,
    contactPerson: stored.contactPerson,
    contactNumber: stored.contactNumber,
    email: stored.email,
    website: stored.website,
    studentCount: BigInt(stored.studentCount || 0),
    createdTimestamp: BigInt(stored.createdTimestamp || 0),
    lastUpdateTimestamp: BigInt(stored.lastUpdateTimestamp || 0),
  };
}

export function getDemoSchools(): School[] {
  try {
    const stored = localStorage.getItem(DEMO_SCHOOLS_KEY);
    if (!stored) return [];
    const storedSchools: StoredSchool[] = JSON.parse(stored);
    if (!Array.isArray(storedSchools)) {
      throw new Error('Invalid schools data format');
    }
    return storedSchools.map(storedToSchool);
  } catch (error) {
    console.warn('Failed to parse demo schools, resetting:', error);
    try {
      localStorage.removeItem(DEMO_SCHOOLS_KEY);
      markDataAsReset();
    } catch {
      // Ignore
    }
    return [];
  }
}

export function saveDemoSchool(school: School): void {
  try {
    const schools = getDemoSchools();
    const index = schools.findIndex(s => s.id === school.id);
    if (index >= 0) {
      schools[index] = school;
    } else {
      schools.push(school);
    }
    const storedSchools = schools.map(schoolToStored);
    localStorage.setItem(DEMO_SCHOOLS_KEY, JSON.stringify(storedSchools));
  } catch (error) {
    console.warn('Failed to save demo school:', error);
  }
}

export function getDemoSchool(id: string): School | null {
  const schools = getDemoSchools();
  return schools.find(s => s.id === id) || null;
}

// ============================================================================
// OUTSTANDING AMOUNTS
// ============================================================================

export function getDemoOutstanding(schoolId: string): bigint {
  try {
    const stored = localStorage.getItem(DEMO_OUTSTANDING_KEY);
    if (!stored) return BigInt(0);
    const data = JSON.parse(stored);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid outstanding data format');
    }
    return BigInt(data[schoolId] || 0);
  } catch (error) {
    console.warn('Failed to parse demo outstanding amounts, resetting:', error);
    try {
      localStorage.removeItem(DEMO_OUTSTANDING_KEY);
      markDataAsReset();
    } catch {
      // Ignore
    }
    return BigInt(0);
  }
}

export function setDemoOutstanding(schoolId: string, amount: bigint): void {
  try {
    const stored = localStorage.getItem(DEMO_OUTSTANDING_KEY);
    const data = stored ? JSON.parse(stored) : {};
    data[schoolId] = amount.toString();
    localStorage.setItem(DEMO_OUTSTANDING_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save demo outstanding amount:', error);
  }
}

export function hasDemoOutstanding(schoolId: string): boolean {
  try {
    const stored = localStorage.getItem(DEMO_OUTSTANDING_KEY);
    if (!stored) return false;
    const data = JSON.parse(stored);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid outstanding data format');
    }
    return schoolId in data && data[schoolId] !== '0';
  } catch (error) {
    console.warn('Failed to check demo outstanding amount:', error);
    return false;
  }
}

export function getAllDemoOutstanding(): Record<string, bigint> {
  try {
    const stored = localStorage.getItem(DEMO_OUTSTANDING_KEY);
    if (!stored) return {};
    const data = JSON.parse(stored);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid outstanding data format');
    }
    const result: Record<string, bigint> = {};
    for (const [schoolId, amount] of Object.entries(data)) {
      result[schoolId] = BigInt(amount as string);
    }
    return result;
  } catch (error) {
    console.warn('Failed to parse all demo outstanding amounts:', error);
    return {};
  }
}

// ============================================================================
// PACKING STATUS
// ============================================================================

export function getDemoPackingStatus(schoolId: string): PackingStatus | null {
  try {
    const stored = localStorage.getItem(DEMO_PACKING_STATUS_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid packing status data format');
    }
    const status = data[schoolId];
    if (!status) return null;
    // Convert string bigints back to bigint
    return {
      ...status,
      kitCount: BigInt(status.kitCount || 0),
      addOnCount: BigInt(status.addOnCount || 0),
      createdTimestamp: BigInt(status.createdTimestamp || 0),
      lastUpdateTimestamp: BigInt(status.lastUpdateTimestamp || 0),
    };
  } catch (error) {
    console.warn('Failed to parse demo packing status, resetting:', error);
    try {
      localStorage.removeItem(DEMO_PACKING_STATUS_KEY);
      markDataAsReset();
    } catch {
      // Ignore
    }
    return null;
  }
}

export function saveDemoPackingStatus(status: PackingStatus): void {
  try {
    const stored = localStorage.getItem(DEMO_PACKING_STATUS_KEY);
    const data = stored ? JSON.parse(stored) : {};
    // Convert bigints to strings for storage
    data[status.schoolId] = {
      ...status,
      kitCount: status.kitCount.toString(),
      addOnCount: status.addOnCount.toString(),
      createdTimestamp: status.createdTimestamp.toString(),
      lastUpdateTimestamp: status.lastUpdateTimestamp.toString(),
    };
    localStorage.setItem(DEMO_PACKING_STATUS_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save demo packing status:', error);
  }
}

export function getAllDemoPackingStatuses(): PackingStatus[] {
  try {
    const stored = localStorage.getItem(DEMO_PACKING_STATUS_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid packing status data format');
    }
    const statuses: PackingStatus[] = [];
    for (const status of Object.values(data)) {
      const s = status as any;
      statuses.push({
        ...s,
        kitCount: BigInt(s.kitCount || 0),
        addOnCount: BigInt(s.addOnCount || 0),
        createdTimestamp: BigInt(s.createdTimestamp || 0),
        lastUpdateTimestamp: BigInt(s.lastUpdateTimestamp || 0),
      });
    }
    return statuses;
  } catch (error) {
    console.warn('Failed to parse all demo packing statuses:', error);
    return [];
  }
}

// ============================================================================
// PACKING COUNTS
// ============================================================================

interface DemoPackingCount {
  classType: PackingClass;
  theme: PackingTheme;
  totalCount: bigint;
  packedCount: bigint;
  addOnCount: bigint;
  createdTimestamp: bigint;
  lastUpdateTimestamp: bigint;
}

function makeCountKey(schoolId: string, classType: PackingClass, theme: PackingTheme): string {
  return `${schoolId}_${classType}_${theme}`;
}

export function getDemoPackingCount(schoolId: string, classType: PackingClass, theme: PackingTheme): DemoPackingCount | null {
  try {
    const stored = localStorage.getItem(DEMO_PACKING_COUNTS_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid packing counts data format');
    }
    const key = makeCountKey(schoolId, classType, theme);
    const count = data[key];
    if (!count) return null;
    return {
      ...count,
      totalCount: BigInt(count.totalCount || 0),
      packedCount: BigInt(count.packedCount || 0),
      addOnCount: BigInt(count.addOnCount || 0),
      createdTimestamp: BigInt(count.createdTimestamp || 0),
      lastUpdateTimestamp: BigInt(count.lastUpdateTimestamp || 0),
    };
  } catch (error) {
    console.warn('Failed to parse demo packing counts, resetting:', error);
    try {
      localStorage.removeItem(DEMO_PACKING_COUNTS_KEY);
      markDataAsReset();
    } catch {
      // Ignore
    }
    return null;
  }
}

export function saveDemoPackingCount(schoolId: string, count: DemoPackingCount): void {
  try {
    const stored = localStorage.getItem(DEMO_PACKING_COUNTS_KEY);
    const data = stored ? JSON.parse(stored) : {};
    const key = makeCountKey(schoolId, count.classType, count.theme);
    data[key] = {
      ...count,
      totalCount: count.totalCount.toString(),
      packedCount: count.packedCount.toString(),
      addOnCount: count.addOnCount.toString(),
      createdTimestamp: count.createdTimestamp.toString(),
      lastUpdateTimestamp: count.lastUpdateTimestamp.toString(),
    };
    localStorage.setItem(DEMO_PACKING_COUNTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save demo packing count:', error);
  }
}

export function getDemoPackingCountsBySchool(schoolId: string): DemoPackingCount[] {
  try {
    const stored = localStorage.getItem(DEMO_PACKING_COUNTS_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid packing counts data format');
    }
    const counts: DemoPackingCount[] = [];
    for (const key in data) {
      if (key.startsWith(schoolId + '_')) {
        const count = data[key];
        counts.push({
          ...count,
          totalCount: BigInt(count.totalCount || 0),
          packedCount: BigInt(count.packedCount || 0),
          addOnCount: BigInt(count.addOnCount || 0),
          createdTimestamp: BigInt(count.createdTimestamp || 0),
          lastUpdateTimestamp: BigInt(count.lastUpdateTimestamp || 0),
        });
      }
    }
    return counts;
  } catch (error) {
    console.warn('Failed to parse demo packing counts by school:', error);
    return [];
  }
}

// ============================================================================
// TRAINING VISITS
// ============================================================================

interface StoredTrainingVisit {
  id: string;
  schoolId: string;
  visitDate: string;
  reason: string;
  visitingPerson: string;
  contactPersonMobile: string;
  observations: string;
  classroomObservationProof?: {
    name: string;
    type: string;
    size: number;
    data: string; // base64
  };
  createdTimestamp: string;
}

let visitCounter = 0;

export function getDemoTrainingVisits(schoolId: string): TrainingVisit[] {
  try {
    const stored = localStorage.getItem(DEMO_TRAINING_VISITS_KEY);
    if (!stored) return [];
    const data: StoredTrainingVisit[] = JSON.parse(stored);
    if (!Array.isArray(data)) {
      throw new Error('Invalid training visits data format');
    }
    return data
      .filter(v => v.schoolId === schoolId)
      .map(v => ({
        id: v.id,
        schoolId: v.schoolId,
        visitDate: BigInt(v.visitDate),
        reason: v.reason,
        visitingPerson: v.visitingPerson,
        contactPersonMobile: v.contactPersonMobile,
        observations: v.observations,
        classroomObservationProof: v.classroomObservationProof
          ? {
              getDirectURL: () => v.classroomObservationProof!.data,
              getBytes: async () => {
                const base64 = v.classroomObservationProof!.data.split(',')[1];
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                  bytes[i] = binary.charCodeAt(i);
                }
                return bytes;
              },
            } as any
          : undefined,
        createdTimestamp: BigInt(v.createdTimestamp),
      }));
  } catch (error) {
    console.warn('Failed to parse demo training visits, resetting:', error);
    try {
      localStorage.removeItem(DEMO_TRAINING_VISITS_KEY);
      markDataAsReset();
    } catch {
      // Ignore
    }
    return [];
  }
}

export function saveDemoTrainingVisit(visit: {
  schoolId: string;
  visitDate: bigint;
  reason: string;
  visitingPerson: string;
  contactPersonMobile: string;
  observations: string;
  classroomObservationProof?: { name: string; type: string; size: number; data: string };
}): string {
  try {
    const stored = localStorage.getItem(DEMO_TRAINING_VISITS_KEY);
    const data: StoredTrainingVisit[] = stored ? JSON.parse(stored) : [];
    visitCounter++;
    const id = `VISIT-DEMO-${visitCounter}`;
    const newVisit: StoredTrainingVisit = {
      id,
      schoolId: visit.schoolId,
      visitDate: visit.visitDate.toString(),
      reason: visit.reason,
      visitingPerson: visit.visitingPerson,
      contactPersonMobile: visit.contactPersonMobile,
      observations: visit.observations,
      classroomObservationProof: visit.classroomObservationProof,
      createdTimestamp: BigInt(Date.now() * 1000000).toString(),
    };
    data.push(newVisit);
    localStorage.setItem(DEMO_TRAINING_VISITS_KEY, JSON.stringify(data));
    return id;
  } catch (error) {
    console.warn('Failed to save demo training visit:', error);
    throw new Error('Failed to save training visit');
  }
}

export function updateDemoTrainingVisit(visit: {
  id: string;
  schoolId: string;
  visitDate: bigint;
  reason: string;
  visitingPerson: string;
  contactPersonMobile: string;
  observations: string;
  classroomObservationProof?: { name: string; type: string; size: number; data: string } | null;
}): void {
  try {
    const stored = localStorage.getItem(DEMO_TRAINING_VISITS_KEY);
    const data: StoredTrainingVisit[] = stored ? JSON.parse(stored) : [];
    const index = data.findIndex(v => v.id === visit.id);
    if (index === -1) {
      throw new Error('Training visit not found');
    }
    data[index] = {
      ...data[index],
      schoolId: visit.schoolId,
      visitDate: visit.visitDate.toString(),
      reason: visit.reason,
      visitingPerson: visit.visitingPerson,
      contactPersonMobile: visit.contactPersonMobile,
      observations: visit.observations,
      classroomObservationProof: visit.classroomObservationProof || undefined,
    };
    localStorage.setItem(DEMO_TRAINING_VISITS_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to update demo training visit:', error);
    throw new Error('Failed to update training visit');
  }
}

// ============================================================================
// ACADEMIC QUERIES
// ============================================================================

interface StoredAcademicQuery {
  id: string;
  schoolId: string;
  raisedBy: string;
  queries: string;
  response?: string;
  status: Variant_resolved_open;
  createdTimestamp: string;
  lastUpdateTimestamp: string;
}

let queryCounter = 0;

export function getDemoAcademicQueries(): AcademicQuery[] {
  try {
    const stored = localStorage.getItem(DEMO_ACADEMIC_QUERIES_KEY);
    if (!stored) return [];
    const data: StoredAcademicQuery[] = JSON.parse(stored);
    if (!Array.isArray(data)) {
      throw new Error('Invalid academic queries data format');
    }
    return data.map(q => ({
      id: q.id,
      schoolId: q.schoolId,
      raisedBy: { toText: () => q.raisedBy } as any,
      queries: q.queries,
      response: q.response,
      status: q.status,
      createdTimestamp: BigInt(q.createdTimestamp),
      lastUpdateTimestamp: BigInt(q.lastUpdateTimestamp),
    }));
  } catch (error) {
    console.warn('Failed to parse demo academic queries, resetting:', error);
    try {
      localStorage.removeItem(DEMO_ACADEMIC_QUERIES_KEY);
      markDataAsReset();
    } catch {
      // Ignore
    }
    return [];
  }
}

export function getDemoAcademicQueriesBySchool(schoolId: string): AcademicQuery[] {
  return getDemoAcademicQueries().filter(q => q.schoolId === schoolId);
}

export function saveDemoAcademicQuery(query: {
  schoolId: string;
  queries: string;
  raisedBy: string;
}): string {
  try {
    const stored = localStorage.getItem(DEMO_ACADEMIC_QUERIES_KEY);
    const data: StoredAcademicQuery[] = stored ? JSON.parse(stored) : [];
    queryCounter++;
    const id = `queries-demo-${queryCounter}`;
    const now = BigInt(Date.now() * 1000000).toString();
    const newQuery: StoredAcademicQuery = {
      id,
      schoolId: query.schoolId,
      raisedBy: query.raisedBy,
      queries: query.queries,
      status: 'open' as Variant_resolved_open,
      createdTimestamp: now,
      lastUpdateTimestamp: now,
    };
    data.push(newQuery);
    localStorage.setItem(DEMO_ACADEMIC_QUERIES_KEY, JSON.stringify(data));
    return id;
  } catch (error) {
    console.warn('Failed to save demo academic query:', error);
    throw new Error('Failed to save academic query');
  }
}

export function updateDemoAcademicQuery(id: string, response: string, status: Variant_resolved_open): void {
  try {
    const stored = localStorage.getItem(DEMO_ACADEMIC_QUERIES_KEY);
    const data: StoredAcademicQuery[] = stored ? JSON.parse(stored) : [];
    const index = data.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Academic query not found');
    }
    data[index] = {
      ...data[index],
      response,
      status,
      lastUpdateTimestamp: BigInt(Date.now() * 1000000).toString(),
    };
    localStorage.setItem(DEMO_ACADEMIC_QUERIES_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to update demo academic query:', error);
    throw new Error('Failed to update academic query');
  }
}
