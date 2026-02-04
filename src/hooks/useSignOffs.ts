'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { Role } from '@/types';

interface UseSignOffsOptions {
  requirementId: string;
  currentUserId?: string;
}

export function useSignOffs({ requirementId, currentUserId }: UseSignOffsOptions) {
  const utils = trpc.useUtils();

  const { data: signOffs, isLoading } = trpc.signOffs.getByRequirement.useQuery(
    { requirementId },
    { enabled: !!requirementId }
  );

  const signOffMutation = trpc.signOffs.signOff.useMutation({
    onSuccess: () => {
      // Invalidate both sign-offs and requirement queries
      utils.signOffs.getByRequirement.invalidate({ requirementId });
      utils.requirements.getById.invalidate({ id: requirementId });
      toast.success('Signed off successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Real-time subscription for sign-offs
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const channel = supabase
      .channel(`sign_offs:${requirementId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sign_offs',
          filter: `requirement_id=eq.${requirementId}`,
        },
        async (payload) => {
          // Only show toast if it's from another user
          if (payload.new.user_id !== currentUserId) {
            // Fetch user details for the toast
            const { data: user } = await supabase
              .from('users')
              .select('name, role')
              .eq('id', payload.new.user_id)
              .single();

            if (user) {
              const roleLabel = getRoleLabel(user.role as Role);
              toast.info(`${user.name} (${roleLabel}) signed off`);
            }

            // Invalidate queries to refresh data
            utils.signOffs.getByRequirement.invalidate({ requirementId });
            utils.requirements.getById.invalidate({ id: requirementId });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requirementId, currentUserId, utils]);

  const signOff = (comment?: string) => {
    signOffMutation.mutate({ requirementId, comment });
  };

  const hasUserSigned = (userId: string): boolean => {
    if (!signOffs) return false;
    const allSignOffs = [...signOffs.TECH, ...signOffs.PRODUCT, ...signOffs.BUSINESS];
    return allSignOffs.some((s) => s.user?.id === userId);
  };

  return {
    signOffs,
    isLoading,
    signOff,
    isSigningOff: signOffMutation.isPending,
    hasUserSigned,
  };
}

function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    TECH: 'Tech Lead',
    PRODUCT: 'Product Owner',
    BUSINESS: 'Business Stakeholder',
  };
  return labels[role];
}
