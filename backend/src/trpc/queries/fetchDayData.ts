import { DayData } from '../../database'
import type { DayDataDTO } from '../../types'

export const fetchLastNDaysData = async (days: number) : Promise<DayDataDTO[]> => {
  try {
    const rawData = await DayData.find()
                                 .sort({ date: -1 })
                                 .limit(days)
                                 .exec()
    
    const data : DayDataDTO[] = rawData.reverse().map((item) => ({
      date: item.date,
      total_consumption: item.total_consumption,
      total_activation: item.total_activation
    })) 
    return data
  } catch (error) {
    throw new Error(`Failed to fetch last ${days} days data: ${error}`)
  }
}