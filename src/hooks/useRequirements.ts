'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface UseRequirementsOptions {
  currentUserId?: string;
}

export function useRequirements({ currentUserId }: UseRequirementsOptions = {}) {
  const utils = trpc.useUtils();

  const { data: requirements, isLoading, error } = trpc.requirements.getAll.useQuery();

  // Real-time subscription for requirements and sign-offs
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Subscribe to requirement status changes (triggered by DB trigger after sign-offs)
    const requirementsChannel = supabase
      .channel('requirements_list')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requirements',
        },
        (payload) => {
          // Check if status changed
          if (payload.old.status !== payload.new.status) {
            const statusLabels: Record<string, string> = {
              DRAFT: 'Draft',
              IN_REVIEW: 'In Review',
              APPROVED: 'Approved',
              REJECTED: 'Rejected',
            };

            toast.info(
              `"${payload.new.title}" is now ${statusLabels[payload.new.status as string] || payload.new.status}`
            );
          }

          // Invalidate the list query to refresh
          utils.requirements.getAll.invalidate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requirements',
        },
        () => {
          toast.info('A new requirement was added');
          utils.requirements.getAll.invalidate();
        }
      )
      .subscribe();

    // Subscribe to sign-offs to show real-time progress
    const signOffsChannel = supabase
      .channel('sign_offs_list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sign_offs',
        },
        async (payload) => {
          // Only show toast if from another user
          if (payload.new.user_id !== currentUserId) {
            // Fetch user details for the toast
            const { data: user } = await supabase
              .from('users')
              .select('name, role')
              .eq('id', payload.new.user_id)
              .single();

            if (user) {
              const roleLabels: Record<string, string> = {
                TECH: 'Tech Lead',
                PRODUCT: 'Product Owner',
                BUSINESS: 'Business Stakeholder',
              };
              toast.info(`${user.name} (${roleLabels[user.role] || user.role}) signed off on a requirement`);
            }
          }

          // Invalidate to refresh sign-off counts in cards
          utils.requirements.getAll.invalidate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requirementsChannel);
      supabase.removeChannel(signOffsChannel);
    };
  }, [currentUserId, utils]);

  return {
    requirements,
    isLoading,
    error,
  };
}
