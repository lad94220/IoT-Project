import { DayDataDTO } from "../../types/index.ts"

export function generateReviewMessage(data: DayDataDTO[]): string {
  const content = data.map(day => {
    const date = new Date(day.date).toLocaleDateString("en-GB")
    const consumption = day.total_consumption?.toFixed(2) ?? "N/A"
    const activation = day.total_activation ?? "N/A"
    return `📅 ${date}:\n🔋 Consumption: ${consumption} Wh\n⚙️ Activation count: ${activation}`
  }).join("\n\n")

  const totalConsumption = data.reduce((sum, day) => sum + (day.total_consumption || 0), 0)
  const avgConsumption = totalConsumption / data.length

  const sorted = [...data].sort((a, b) => (b.total_consumption || 0) - (a.total_consumption || 0))
  const highest = sorted[0]
  const lowest = sorted[sorted.length - 1]

  const highestDay = new Date(highest.date).toLocaleDateString("en-GB")
  const lowestDay = new Date(lowest.date).toLocaleDateString("en-GB")

  const highestStr = `📈 Highest: ${highestDay} with ${highest.total_consumption?.toFixed(2)} Wh`
  const lowestStr = `📉 Lowest: ${lowestDay} with ${lowest.total_consumption?.toFixed(2)} Wh`

  let insight = ""
  if (avgConsumption > 500) {
    insight = "⚠️ High energy usage this week. Consider checking devices."
  } else if (avgConsumption > 200) {
    insight = "✅ Energy usage is stable. Good work, but stay mindful."
  } else {
    insight = "🌿 Great job! Low consumption this week. Keep it up!"
  }

  return `📊 Energy usage for the past 7 days:\n\n${content}\n\n${highestStr}\n${lowestStr}\n\n🔎 Insight:\n${insight}`
}