import { router, publicProcedure } from './base'
import { z } from 'zod'
import { fetchLastNDaysData, fetchTodayData, fetchHistory } from './queries'

const fetchLastNDaysDataSchema = z.object({
  days: z.number().min(1).max(30),
})

const fetchHistorySchema = z.object({
  numbers: z.number().min(1),
})

export const fetchRouter = router({
  getLastNDays: publicProcedure
    .input(fetchLastNDaysDataSchema)
    .query(({ input }) => fetchLastNDaysData(input.days)),

  getTodayData: publicProcedure.query(() => fetchTodayData()),
  
  getHistory: publicProcedure
    .input(fetchHistorySchema)
    .query(({ input }) => fetchHistory(input.numbers)),
})