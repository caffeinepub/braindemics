// Synthetic UserProfile factory for Demo/Preview Mode
// Creates a fake profile based on the selected role without backend calls

import type { UserProfile, StaffRole } from '../backend';
import { StaffRole as StaffRoleEnum } from '../backend';

export function createDemoProfile(role: StaffRole): UserProfile {
  const roleProfiles: Record<StaffRole, UserProfile> = {
    [StaffRoleEnum.admin]: {
      fullName: 'Demo Admin',
      role: StaffRoleEnum.admin,
      department: 'Administration',
      contactNumber: '+1234567890',
      email: 'admin@demo.braindemics.local',
    },
    [StaffRoleEnum.marketing]: {
      fullName: 'Demo Marketing',
      role: StaffRoleEnum.marketing,
      department: 'Marketing',
      contactNumber: '+1234567891',
      email: 'marketing@demo.braindemics.local',
    },
    [StaffRoleEnum.accounts]: {
      fullName: 'Demo Accounts',
      role: StaffRoleEnum.accounts,
      department: 'Accounts',
      contactNumber: '+1234567892',
      email: 'accounts@demo.braindemics.local',
    },
    [StaffRoleEnum.packing]: {
      fullName: 'Demo Packing',
      role: StaffRoleEnum.packing,
      department: 'Packing',
      contactNumber: '+1234567893',
      email: 'packing@demo.braindemics.local',
    },
    [StaffRoleEnum.training]: {
      fullName: 'Demo Training',
      role: StaffRoleEnum.training,
      department: 'Training',
      contactNumber: '+1234567894',
      email: 'training@demo.braindemics.local',
    },
    [StaffRoleEnum.academic]: {
      fullName: 'Demo Academic',
      role: StaffRoleEnum.academic,
      department: 'Academic',
      contactNumber: '+1234567895',
      email: 'academic@demo.braindemics.local',
    },
  };

  return roleProfiles[role];
}
