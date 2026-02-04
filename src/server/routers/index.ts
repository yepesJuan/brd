import { router } from '../trpc';
import { requirementsRouter } from './requirements';
import { signOffsRouter } from './signoffs';
import { authRouter } from './auth';

export const appRouter = router({
  requirements: requirementsRouter,
  signOffs: signOffsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
