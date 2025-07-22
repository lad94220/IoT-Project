import { SensorData } from '../../database'

export const calculateConsumption = async (historyID: string): Promise<number> => {
  try {
    const result = await SensorData.aggregate([
      {
        $match: { activation: historyID }
      },
      {
        $group: {
          _id: '$activation',
          totalConsumption: {
            $sum: { $multiply: ['$current', '$voltage'] }
          }
        }
      }
    ])

    const totalConsumptionWs = result[0]?.totalConsumption || 0;
    // Convert from watt-seconds (Ws) to kilowatt-hours (Wh)
    return totalConsumptionWs / 3600;
  } catch (error) {
    throw new Error(`Failed to calculate consumption: ${error}`)
  }
}