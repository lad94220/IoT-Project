import express from 'express'
import dotenv from 'dotenv'
import { connectToMQTT, connectOnSocket, saveDataToDB, controlAutoMode, controlDevice, controlChatCommand } from './libs'
import { connectToDatabase, createDevice, createNewDay, scheduleAliveCheck } from './database'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './trpc'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { bot } from './bot'
import { sendEmail, EmailSignal } from './notification'

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
  controlChatCommand(socket)
})

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)

  setTimeout(async () => {
    await sendEmail(EmailSignal.Welcome)
  }, 100)
})

createDevice('test-device')
createNewDay()
scheduleAliveCheck()

saveDataToDB()

bot.start()

export type AppRouter = typeof appRouter