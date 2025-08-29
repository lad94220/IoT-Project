import { authRouter } from './auth'
import { fetchRouter } from './fetch'
import { router } from './base'

export const appRouter = router({
  fetch: fetchRouter,
  auth: authRouter,
})
