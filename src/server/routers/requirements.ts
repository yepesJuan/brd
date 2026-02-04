import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, businessProcedure } from '../trpc';
import { createRequirementSchema } from './schema';

export const requirementsRouter = router({
  // Get all requirements
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('requirements')
      .select(`
        *,
        uploaded_by_user:users!uploaded_by(id, name, avatar_url),
        sign_offs(id, role, user_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    return data;
  }),

  // Get single requirement with all sign-offs
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('requirements')
        .select(`
          *,
          uploaded_by_user:users!uploaded_by(id, name, avatar_url, role),
          sign_offs(
            id,
            role,
            comment,
            signed_at,
            user:users(id, name, avatar_url)
          )
        `)
        .eq('id', input.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Requirement not found',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Create requirement (BUSINESS only)
  create: businessProcedure
    .input(createRequirementSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('requirements')
        .insert({
          title: input.title,
          description: input.description,
          file_path: input.filePath,
          file_name: input.fileName,
          epic_link: input.epicLink || null,
          uploaded_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Generate signed URL for document download
  getSignedUrl: protectedProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.storage
        .from('requirements')
        .createSignedUrl(input.filePath, 3600); // 1 hour expiry

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Upload file to storage
  getUploadUrl: businessProcedure
    .input(z.object({ fileName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const filePath = `${ctx.user.id}/${Date.now()}-${input.fileName}`;

      const { data, error } = await ctx.supabase.storage
        .from('requirements')
        .createSignedUploadUrl(filePath);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { ...data, filePath };
    }),
});
