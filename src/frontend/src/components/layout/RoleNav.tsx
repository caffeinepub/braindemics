import { useEffect, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import type { StaffRole } from '../../backend';
import {
  LayoutDashboard,
  Users,
  FileText,
  School,
  MessageSquare,
} from 'lucide-react';

interface RoleNavProps {
  role: StaffRole;
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function RoleNav({ role, mobile, onNavigate }: RoleNavProps) {
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState(role);

  // Update when role prop changes (e.g., from demo role switching)
  useEffect(() => {
    setCurrentRole(role);
  }, [role]);

  const navItems = {
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/staff', label: 'Staff Management', icon: Users },
      { to: '/admin/audit', label: 'Audit Logs', icon: FileText },
    ],
    marketing: [
      { to: '/marketing/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/marketing/schools/create', label: 'Register School', icon: School },
    ],
    accounts: [
      { to: '/accounts/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
    packing: [
      { to: '/packing/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
    training: [
      { to: '/training/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/training/queries', label: 'My Queries', icon: MessageSquare },
    ],
    academic: [
      { to: '/academic/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/academic/queries', label: 'All Queries', icon: MessageSquare },
    ],
  };

  const items = navItems[currentRole] || [];

  return (
    <nav className={cn('py-6 px-3 space-y-1', mobile && 'pt-16')}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
