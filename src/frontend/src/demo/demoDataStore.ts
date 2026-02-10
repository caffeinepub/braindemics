// Demo/Preview Mode local data persistence
// Stores schools, outstanding amounts, packing status, and counts in localStorage

import type { School, PackingStatus, PackingClass, PackingTheme } from '../backend';

const DEMO_SCHOOLS_KEY = 'braindemics_demo_schools';
const DEMO_OUTSTANDING_KEY = 'braindemics_demo_outstanding';
const DEMO_PACKING_STATUS_KEY = 'braindemics_demo_packing_status';
const DEMO_PACKING_COUNTS_KEY = 'braindemics_demo_packing_counts';

// ============================================================================
// SCHOOLS
// ============================================================================

export function getDemoSchools(): School[] {
  try {
    const stored = localStorage.getItem(DEMO_SCHOOLS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveDemoSchool(school: School): void {
  const schools = getDemoSchools();
  const index = schools.findIndex(s => s.id === school.id);
  if (index >= 0) {
    schools[index] = school;
  } else {
    schools.push(school);
  }
  localStorage.setItem(DEMO_SCHOOLS_KEY, JSON.stringify(schools));
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
    return BigInt(data[schoolId] || 0);
  } catch {
    return BigInt(0);
  }
}

export function setDemoOutstanding(schoolId: string, amount: bigint): void {
  try {
    const stored = localStorage.getItem(DEMO_OUTSTANDING_KEY);
    const data = stored ? JSON.parse(stored) : {};
    data[schoolId] = amount.toString();
    localStorage.setItem(DEMO_OUTSTANDING_KEY, JSON.stringify(data));
  } catch {
    // Ignore errors
  }
}

export function hasDemoOutstanding(schoolId: string): boolean {
  try {
    const stored = localStorage.getItem(DEMO_OUTSTANDING_KEY);
    if (!stored) return false;
    const data = JSON.parse(stored);
    return schoolId in data && data[schoolId] !== '0';
  } catch {
    return false;
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
    const status = data[schoolId];
    if (!status) return null;
    // Convert string bigints back to bigint
    return {
      ...status,
      kitCount: BigInt(status.kitCount),
      addOnCount: BigInt(status.addOnCount),
      createdTimestamp: BigInt(status.createdTimestamp),
      lastUpdateTimestamp: BigInt(status.lastUpdateTimestamp),
    };
  } catch {
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
  } catch {
    // Ignore errors
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
    const key = makeCountKey(schoolId, classType, theme);
    const count = data[key];
    if (!count) return null;
    return {
      ...count,
      totalCount: BigInt(count.totalCount),
      packedCount: BigInt(count.packedCount),
      addOnCount: BigInt(count.addOnCount),
      createdTimestamp: BigInt(count.createdTimestamp),
      lastUpdateTimestamp: BigInt(count.lastUpdateTimestamp),
    };
  } catch {
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
  } catch {
    // Ignore errors
  }
}

export function getDemoPackingCountsBySchool(schoolId: string): DemoPackingCount[] {
  try {
    const stored = localStorage.getItem(DEMO_PACKING_COUNTS_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    const counts: DemoPackingCount[] = [];
    for (const key in data) {
      if (key.startsWith(schoolId + '_')) {
        const count = data[key];
        counts.push({
          ...count,
          totalCount: BigInt(count.totalCount),
          packedCount: BigInt(count.packedCount),
          addOnCount: BigInt(count.addOnCount),
          createdTimestamp: BigInt(count.createdTimestamp),
          lastUpdateTimestamp: BigInt(count.lastUpdateTimestamp),
        });
      }
    }
    return counts;
  } catch {
    return [];
  }
}
