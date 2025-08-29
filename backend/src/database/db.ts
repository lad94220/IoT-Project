import mongoose from 'mongoose'
import cron from 'node-cron'
import moment from 'moment-timezone'
import { SensorData, DeviceStatus, DayData, ActivateHistory } from './models'
import { convertDayId } from '../libs/'
import { sendEmail, EmailSignal } from '../notification'
import { sendPushNoti } from '../notification'

let lastAlive = Date.now()
let lastState = true
const DEVICE_ALIVE_TIMEOUT = 35000

export const updateLastAlive = async () => {
  lastAlive = Date.now()
  if (!lastState) {
    lastState = true
    await sendPushNoti('Kết nối đèn', 'Đèn đã kết nối lại', 95)
    await sendEmail(EmailSignal.DeviceReconnected)
  }
}

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('Connected to MongoDB successfully')
  } catch (error) {
    throw new Error(`Failed to connect to database: ${error}`)
  }
}

export const createDevice = async (deviceName: string) => {
  try {
    const exist = await DeviceStatus.findOne({ device: deviceName }).exec()
    if (!exist) {
      DeviceStatus.create({
        device: deviceName,
        auto_mode: true,
        isOn: false
      })
    }
  } catch (error) {
    throw new Error(`Failed to create device: ${error}`)
  }
}

export const updateIsOnStatus = async (deviceName: string, isOn: boolean) => {
  try {
    const device = await DeviceStatus.findOne({ device: deviceName }).exec()
    if (!device) {
      throw new Error(`Device ${deviceName} not found`)
    }
    device.isOn = isOn
    await device.save()
  } catch (error) {
    throw new Error(`Failed to update device status: ${error}`)
  }
}

export const updateAutoMode = async (deviceName: string, autoMode: boolean) => {
  try {
    const device = await DeviceStatus.findOne({ device: deviceName }).exec()
    if (!device) {
      throw new Error(`Device ${deviceName} not found`)
    }
    device.auto_mode = autoMode
    await device.save()
  } catch (error) {
    throw new Error(`Failed to update auto mode: ${error}`)
  }
}

export const createDayData = async (date: Date) => {
  try {
    const exist = await DayData.findOne({ _id: convertDayId(date) }).exec()
    if (!exist) {
      await DayData.create({
        _id: convertDayId(date),
        date: date,
        total_consumption: 0,
        total_activation: 0
      })
    }
  } catch (error) {
    throw new Error(`Failed to create day data: ${error}`)
  }
}

export const createNewDay = async () => {
  try {
    const now = moment().tz('Asia/Bangkok')
    await createDayData(now.toDate())
  } catch (error) {
    throw new Error(`Failed to create new day: ${error}`)
  }
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = moment().tz('Asia/Bangkok')
      await createDayData(now.toDate())
    } catch (error) {
      throw new Error(`Failed to create new day: ${error}`)
    }
  }, {
    timezone: 'Asia/Bangkok'
  })

}

export const scheduleAliveCheck = async () => {
  cron.schedule('*/10 * * * * *', async () => {
    
    if (Date.now() - lastAlive > DEVICE_ALIVE_TIMEOUT && lastState) {
      lastState = false
      await sendPushNoti('Kết nối đèn', 'Đèn đã mất kết nối', 97)
      await sendEmail(EmailSignal.DeviceDisconnected)
    }
  })
}

// Update the total consumption and activation for a specific day after turn on the device
export const updateDayData = async (date: Date, consumption: number, activation: number) => {
  try {
    const dayData = await DayData.findOne({ _id: convertDayId(date) }).exec()
    if (!dayData) {
      throw new Error(`Day data for ${date} not found`)
    } else {
      dayData.total_consumption += consumption
      dayData.total_activation += activation
      await dayData.save()
    }
  } catch (error) {
    throw new Error(`Failed to update day data: ${error}`)
  }
}

export const createHistory = async (data: { _id: string, date: string, activate_time: Date, end_time: Date, duration: number, consumption: number }) => {
  try {
    const exist = await ActivateHistory.findOne({ _id: data._id }).exec()
    if (exist) {
      throw new Error(`History with id ${data._id} already exists`)
    }
    await ActivateHistory.create(data)
  } catch (error) {
    throw new Error(`Failed to create history: ${error}`)
  }
}

export const updateHistoryDurationAndConsumption = async (_id: string, end_time: Date, consumption: number) => {
  try {
    const exist = await ActivateHistory.findOne({ _id }).exec()
    if (!exist) {
      throw new Error(`History with id ${_id} not found`)
    }
    exist.end_time = end_time
    exist.duration = exist.end_time.getTime() - exist.activate_time.getTime()
    exist.duration = Math.floor(exist.duration / 1000)
    exist.consumption = consumption

    await exist.save()
  } catch (error) {
    throw new Error(`Failed to update duration and consumption: ${error}`)
  }
}

export const getDayActivation = async (date: Date) => {
  try {
    const dayData = await DayData.findOne({ _id: convertDayId(date) }).exec()
    if (!dayData) {
      throw new Error(`Day data for ${date} not found`)
    }
    return dayData.total_activation
  } catch (error) {
    throw new Error(`Failed to get day activation: ${error}`)
  }
}

export const saveSensorData = async (data: {activation: string, timestamp: Date, current: number, voltage: number }) => {
  try {
    await SensorData.create(data)
  } catch (error) {
    throw new Error(`Failed to save data: ${error}`)
  }
}