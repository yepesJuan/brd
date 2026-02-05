'use client';

import { useState } from 'react';
import { useRequirements } from '@/hooks/useRequirements';
import { RequirementCard } from './RequirementCard';
import type { Status } from '@/types';

const STATUS_FILTERS: Array<{ value: Status | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
];

interface RequirementListProps {
  currentUserId?: string;
}

export function RequirementList({ currentUserId }: RequirementListProps) {
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const { requirements, isLoading, error } = useRequirements({ currentUserId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Failed to load requirements: {error.message}
      </div>
    );
  }

  const filteredRequirements =
    statusFilter === 'ALL'
      ? requirements
      : requirements?.filter((r) => r.status === statusFilter);

  return (
    <div>
      {/* Status filter tabs */}
      <div className="mb-6 flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === filter.value
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Requirements grid */}
      {filteredRequirements?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No requirements found
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequirements?.map((requirement) => (
            <RequirementCard
              key={requirement.id}
              id={requirement.id}
              title={requirement.title}
              status={requirement.status as Status}
              uploadedBy={requirement.uploaded_by_user}
              signOffs={requirement.sign_offs}
              createdAt={requirement.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
