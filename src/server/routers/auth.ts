import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { registerSchema, loginSchema } from './schema';

export const authRouter = router({
  // Get current user
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  // Register new user
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      // Create auth user
      const { data: authData, error: authError } = await ctx.supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });

      if (authError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: authError.message,
        });
      }

      if (!authData.user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }

      // Create public.users entry with role
      const { error: profileError } = await ctx.supabase.from('users').insert({
        id: authData.user.id,
        email: input.email,
        name: input.name,
        role: input.role,
      });

      if (profileError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user profile',
        });
      }

      return { success: true };
    }),

  // Login
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message,
        });
      }

      return { success: true, user: data.user };
    }),

  // Logout
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    return { success: true };
  }),
});
