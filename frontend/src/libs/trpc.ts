import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../../backend/src/types'

export const trpc = createTRPCReact<AppRouter>()