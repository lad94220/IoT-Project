import { DeviceStatus } from "../../database/models/DeviceStatus"
import { SensorData } from "../../database/models/SensorData"
import { fetchTodayData } from "../../trpc/queries/fetchTodayData"
import { fetchLastNDaysData } from "../../trpc/queries/fetchDayData"
import { generateReviewMessage } from "./generateReview"

export async function getGuide(): Promise<string> {
  return ["🛠 Available Commands:",
                "/status – Show current device status",
                "/power_today – Show today's energy consumption",
                "/review – Show data of last 7 days",
                "/help – Show this help menu",].join("\n")
}

export async function getStatusSummary(): Promise<string> {
  const device = await DeviceStatus.findOne().sort({ _id: -1 })

  console.log(device)

  if (!device) return "⚠️ No device status available."

  if (!device.isOn) {
    return `📊 System Status:
⚙️ Mode: ${device.auto_mode ? "Auto" : "Manual"}
💡 Device: OFF`
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const latest = await SensorData.findOne({
    timestamp: { $gte: startOfToday, $lte: now }
  }).sort({ timestamp: -1 })

  if (!latest) return "⚠️ No sensor data available for today."

  return `📊 System Status:
⚙️ Mode: ${device.auto_mode ? "Auto" : "Manual"}
💡 Device: ON
🔌 Voltage: ${latest.voltage.toFixed(3)} V
🔋 Current: ${latest.current.toFixed(3)} A`
}

export async function getTodayPower(): Promise<string> {
  const today = await fetchTodayData()
  return `🔋 Power Consumption Today:
⚡ Total Usage: ${today.total_consumption.toFixed(2)} Wh
📈 Activations: ${today.total_activation}`
}

export async function getReviewSummary(): Promise<string> {
  const data = await fetchLastNDaysData(7)
  return await generateReviewMessage(data)
}
