import { Socket } from 'socket.io'
import { client } from '../index'
import { getGuide, getStatusSummary, getTodayPower, getReviewSummary } from "../libs/helper/bot-logic.ts"
import { updateAutoMode } from '../database'

export const connectOnSocket = (socket: Socket) => {
  console.log('A user connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
}

export const controlAutoMode = (socket: Socket) => {
  socket.on('controlAutoMode', (data: { autoMode: boolean }) => {
    try {
      updateAutoMode('test-device', data.autoMode)
      client.publish(process.env.MQTT_TOPIC_AUTO as string, JSON.stringify({ isAuto: data.autoMode }))
    } catch (error) {
      console.error('Error controlling auto mode:', error)
    }
  })
}

export const controlDevice = (socket: Socket) => {
  socket.on('controlDevice', (data: { isOn: boolean }) => {
    try {
      client.publish(process.env.MQTT_TOPIC_CONTROL as string, JSON.stringify({ isOn: data.isOn }))
    } catch (error) {
      console.error('Error controlling device:', error)
    }
  })
}

export const controlChatCommand = (socket: Socket) => {
  socket.on("chatbot-command", async ({ command }) => {
    let msg = ""

    switch (command) {
      case "/help":
        msg = await getGuide()
        break
      case "/status":
        msg = await getStatusSummary()
        break
      case "/power_today":
        msg = await getTodayPower()
        break
      case "/review":
        msg = await getReviewSummary()
        break
      default:
        msg = "❌ Unknown command"
    }

    socket.emit("chatbot-response", {
      command,
      msg,
      time: new Date().toISOString()
    })
  })
}