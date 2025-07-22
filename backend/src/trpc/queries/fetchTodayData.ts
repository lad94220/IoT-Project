import type { DayDataDTO } from '../../types'
import { DayData } from '../../database'
import { convertDayId } from '../../libs'

export const fetchTodayData = async (): Promise<DayDataDTO> => {
  try {
    const todayId = convertDayId(new Date())
    const rawData = await DayData.findOne({ _id: todayId }).exec()
    if (!rawData) {
      throw new Error(`No data found for today: ${todayId}`)
    }
    const data: DayDataDTO = {
      date: rawData.date,
      total_consumption: rawData.total_consumption,
      total_activation: rawData.total_activation
    }
    return data
  } catch (error) {
    throw new Error(`Failed to fetch today's data: ${error}`)
  }
}