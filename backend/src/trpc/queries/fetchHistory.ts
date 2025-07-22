import type { HistoryDataDTO } from '../../types'
import { ActivateHistory } from '../../database'

export const fetchHistory = async (numbers: number): Promise<HistoryDataDTO[]> => {
  try {
    const history = await ActivateHistory.find().sort({ activate_time: -1 }).limit(numbers).exec()
    const historyData : HistoryDataDTO[] = history.map((item) => ({
      date: item.activate_time,
      duration: item.duration
    }))
    return historyData
  } catch (error) {
    throw new Error(`Failed to fetch history data: ${error}`)
  }
}