'use client';

import type { Role, Status } from '@/types';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md';
}

const roleStyles: Record<Role, string> = {
  TECH: 'bg-blue-100 text-blue-800',
  PRODUCT: 'bg-purple-100 text-purple-800',
  BUSINESS: 'bg-green-100 text-green-800',
};

const roleLabels: Record<Role, string> = {
  TECH: 'Tech Lead',
  PRODUCT: 'Product Owner',
  BUSINESS: 'Business',
};

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${roleStyles[role]} ${sizeClasses}`}>
      {roleLabels[role]}
    </span>
  );
}

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusStyles: Record<Status, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<Status, string> = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${statusStyles[status]} ${sizeClasses}`}>
      {statusLabels[status]}
    </span>
  );
}
