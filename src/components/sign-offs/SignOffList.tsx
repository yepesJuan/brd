'use client';

import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/utils';
import type { SignOffWithUser } from '@/types';

interface SignOffListProps {
  signOffs: SignOffWithUser[];
}

export function SignOffList({ signOffs }: SignOffListProps) {
  if (signOffs.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No sign-offs yet</p>
    );
  }

  return (
    <ul className="space-y-2">
      {signOffs.map((signOff) => (
        <li key={signOff.id} className="flex items-start gap-2">
          <Avatar
            src={signOff.user?.avatar_url}
            name={signOff.user?.name ?? 'Unknown'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {signOff.user?.name}
              </span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(signOff.signed_at)}
              </span>
            </div>
            {signOff.comment && (
              <p className="text-sm text-gray-600 mt-0.5">{signOff.comment}</p>
            )}
          </div>
          <svg
            className="h-5 w-5 text-green-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </li>
      ))}
    </ul>
  );
}
