import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_TRPC_URL! || 'http://localhost:4000')

export const socketControlDevice = (isOn: boolean) => {
  socket.emit('controlDevice', {
    isOn
  })
}

export const socketControlAutoMode = (autoMode: boolean) => {
  socket.emit('controlAutoMode', {
    autoMode
  })
}