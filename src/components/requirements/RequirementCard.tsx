'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import type { Status, Role } from '@/types';

interface RequirementCardProps {
  id: string;
  title: string;
  status: Status;
  uploadedBy: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  signOffs: Array<{ role: Role }>;
  createdAt: string;
}

export function RequirementCard({
  id,
  title,
  status,
  uploadedBy,
  signOffs,
  createdAt,
}: RequirementCardProps) {
  // Count unique roles that have signed
  const signedRoles = new Set(signOffs.map((s) => s.role));
  const signedCount = signedRoles.size;

  return (
    <Link href={`/requirements/${id}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate">{title}</h3>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Avatar src={uploadedBy.avatar_url} name={uploadedBy.name} size="sm" />
                <span className="truncate">{uploadedBy.name}</span>
              </div>
              <span>·</span>
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Sign-off progress */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {signedCount === 0
              ? 'No sign-offs yet'
              : signedCount === 3
              ? 'All roles signed'
              : `${signedCount}/3 roles signed`}
          </span>
          <div className="flex gap-1">
            {(['TECH', 'PRODUCT', 'BUSINESS'] as Role[]).map((role) => (
              <div
                key={role}
                className={`h-1.5 w-6 rounded-full ${
                  signedRoles.has(role) ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
