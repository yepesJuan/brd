import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { signOffSchema } from './schema';

export const signOffsRouter = router({
  // Get sign-offs for a requirement grouped by role
  getByRequirement: protectedProcedure
    .input(z.object({ requirementId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('sign_offs')
        .select(`
          id,
          requirement_id,
          user_id,
          role,
          comment,
          signed_at,
          user:users(id, name, avatar_url)
        `)
        .eq('requirement_id', input.requirementId)
        .order('signed_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Transform user array to single object and group by role
      const transformed = data?.map((s) => ({
        ...s,
        user: Array.isArray(s.user) ? s.user[0] : s.user,
      })) ?? [];

      return {
        TECH: transformed.filter((s) => s.role === 'TECH'),
        PRODUCT: transformed.filter((s) => s.role === 'PRODUCT'),
        BUSINESS: transformed.filter((s) => s.role === 'BUSINESS'),
      };
    }),

  // Sign off on a requirement
  signOff: protectedProcedure
    .input(signOffSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if requirement is still open
      const { data: requirement } = await ctx.supabase
        .from('requirements')
        .select('status')
        .eq('id', input.requirementId)
        .single();

      if (requirement?.status === 'APPROVED' || requirement?.status === 'REJECTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot sign off on a completed requirement',
        });
      }

      const { data, error } = await ctx.supabase
        .from('sign_offs')
        .insert({
          requirement_id: input.requirementId,
          user_id: ctx.user.id,
          role: ctx.user.role,
          comment: input.comment,
        })
        .select(`
          id,
          requirement_id,
          user_id,
          role,
          comment,
          signed_at,
          user:users(id, name, avatar_url)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'You have already signed off on this requirement',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return {
        ...data,
        user: Array.isArray(data.user) ? data.user[0] : data.user,
      };
    }),
});
