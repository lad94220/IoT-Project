import { client } from '../../index'
import { convertDayId, calculateConsumption } from '../helper'
import { io } from '../../index'
import {
  createHistory,
  getDayActivation,
  saveSensorData,
  updateHistoryDurationAndConsumption,
  updateDayData
} from '../../database'

const activeSessions = new Map<string, string>()

export const saveDataToDB = () => {
  client.on('message', async (topic, message) => {
    const msg = JSON.parse(message.toString())
    const now = new Date()

    if (topic === 'activate') {
      await handleActivation(msg, now)
    } else if (topic === 'send/data') {
      await handleSensorData(msg, now)
    }
  })
}

async function handleActivation(msg: any, now: Date) {
  if (msg.activate === true) {
    io.emit('status', true)
    const dayActivation = await getDayActivation(now)
    const historyID = `${convertDayId(now)}-${dayActivation + 1}`
    
    try {
      await createHistory({
        _id: historyID,
        date: convertDayId(now),
        activate_time: now,
        end_time: now,
        duration: 0,
        consumption: 0
      })
      activeSessions.set(msg.clientId, historyID)
    } catch (error) {
      console.error(`Failed to create history: ${error}`)
    }

  } else if (msg.activate === false) {
    const historyID = activeSessions.get(msg.clientId)
    if (!historyID) return

    try {
      const consumption = await calculateConsumption(historyID)
      await updateHistoryDurationAndConsumption(historyID, now, consumption)
      await updateDayData(now, consumption, 1)
      activeSessions.delete(msg.clientId)
    } catch (error) {
      console.error(`Failed to handle deactivation: ${error}`)
    }

    io.emit('status', false)
    io.emit('refetch')
  }
}

async function handleSensorData(msg: any, now: Date) {
  const historyID = activeSessions.get(msg.clientId)
  if (!historyID) return

  try {
    await saveSensorData({
      activation: historyID,
      timestamp: now,
      current: msg.current,
      voltage: msg.volts
    })
  } catch (error) {
    console.error(`Failed to save sensor data: ${error}`)
  }

  io.emit('sensorData', {
    current: msg.current,
    voltage: msg.volts,
  })
}
