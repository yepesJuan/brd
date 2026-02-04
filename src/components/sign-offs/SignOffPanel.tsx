'use client';

import { useSignOffs } from '@/hooks/useSignOffs';
import { RoleBadge } from '@/components/ui/Badge';
import { SignOffList } from './SignOffList';
import { SignOffButton } from './SignOffButton';
import type { Role, Status, User } from '@/types';

interface SignOffPanelProps {
  requirementId: string;
  status: Status;
  currentUser: User;
}

const ROLE_ORDER: Role[] = ['TECH', 'PRODUCT', 'BUSINESS'];

export function SignOffPanel({ requirementId, status, currentUser }: SignOffPanelProps) {
  const { signOffs, isLoading, signOff, isSigningOff, hasUserSigned } = useSignOffs({
    requirementId,
    currentUserId: currentUser.id,
  });

  const isLocked = status === 'APPROVED' || status === 'REJECTED';
  const userHasSigned = hasUserSigned(currentUser.id);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Sign-Offs</h2>
        {isLocked && (
          <p className="mt-1 text-sm text-gray-500">
            This requirement is {status.toLowerCase()} and locked for changes.
          </p>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {ROLE_ORDER.map((role) => {
          const roleSignOffs = signOffs?.[role] ?? [];
          const isOwnRole = currentUser.role === role;
          const hasRoleSignOff = roleSignOffs.length > 0;

          return (
            <div key={role} className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RoleBadge role={role} size="sm" />
                  {hasRoleSignOff && (
                    <span className="text-xs text-green-600 font-medium">
                      ({roleSignOffs.length} signed)
                    </span>
                  )}
                </div>
                <SignOffButton
                  onSignOff={signOff}
                  isLoading={isSigningOff}
                  disabled={isLocked}
                  hasSigned={isOwnRole && userHasSigned}
                  isOwnRole={isOwnRole}
                />
              </div>
              <SignOffList signOffs={roleSignOffs} />
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {getProgressText(signOffs)}
          </span>
          <div className="flex gap-1">
            {ROLE_ORDER.map((role) => {
              const hasSignOff = (signOffs?.[role]?.length ?? 0) > 0;
              return (
                <div
                  key={role}
                  className={`h-2 w-8 rounded-full ${
                    hasSignOff ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  title={`${role}: ${hasSignOff ? 'Signed' : 'Pending'}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getProgressText(signOffs: Record<Role, unknown[]> | undefined): string {
  if (!signOffs) return 'Loading...';

  const signedCount = ROLE_ORDER.filter(
    (role) => (signOffs[role]?.length ?? 0) > 0
  ).length;

  if (signedCount === 0) return 'Waiting for sign-offs';
  if (signedCount === 3) return 'All roles have signed off';
  return `${signedCount}/3 roles signed`;
}
