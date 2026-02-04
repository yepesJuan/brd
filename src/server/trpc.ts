import { initTRPC, TRPCError } from '@trpc/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import superjson from 'superjson';
import type { User } from '@/types';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  let user: User | null = null;
  if (session?.user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    user = data;
  }

  return {
    supabase,
    session,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});

// Role-specific procedures
export const businessProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'BUSINESS') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only Business Stakeholders can perform this action',
    });
  }
  return next({ ctx });
});
