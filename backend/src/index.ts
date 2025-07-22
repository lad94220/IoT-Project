import express from 'express'
import dotenv from 'dotenv'
import { connectToMQTT, connectOnSocket, saveDataToDB, controlAutoMode, controlDevice } from './libs'
import { connectToDatabase, createDevice, createNewDay } from './database'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './trpc'
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config({
  path: './.env'
})

connectToDatabase()

const app = express()
app.use(cors())

const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext: () => ({})}))

export const client = connectToMQTT()

io.on('connection', (socket) => {
  connectOnSocket(socket)
  controlAutoMode(socket)
  controlDevice(socket)
})

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
})

createDevice('test-device')
createNewDay()

saveDataToDB()

export type AppRouter = typeof appRouter