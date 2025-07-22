import { Socket } from 'socket.io'
import { client } from '../index'

export const connectOnSocket = (socket: Socket) => {
  console.log('A user connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
}

export const controlAutoMode = (socket: Socket) => {
  socket.on('controlAutoMode', (data: { autoMode: boolean }) => {
    client.publish(process.env.MQTT_TOPIC_AUTO as string, JSON.stringify({ isAuto: data.autoMode }))
  })
}

export const controlDevice = (socket: Socket) => {
  socket.on('controlDevice', (data: { isOn: boolean }) => {
    client.publish(process.env.MQTT_TOPIC_CONTROL as string, JSON.stringify({ isOn: data.isOn }))
  })
}