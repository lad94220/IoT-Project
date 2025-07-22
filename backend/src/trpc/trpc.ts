import { z } from 'zod'
import { fetchLastNDaysData, fetchTodayData, fetchHistory } from './queries'
import { authRouter } from './auth'
import { router, publicProcedure } from './base'

export const appRouter = router({
  fetchDayData: publicProcedure.input(z.object({ number: z.number().min(1) })).query(async ({ input }) => {
    return await fetchLastNDaysData(input.number)
  }),
  fetchTodayData: publicProcedure.query(async () => {
    return await fetchTodayData()
  }),
  fetchHistory: publicProcedure.input(z.object({ numbers: z.number().min(1) })).query(async ({ input }) => {
    return await fetchHistory(input.numbers)
  }),
  auth: authRouter,
})

export type AppRouter = typeof appRouter
