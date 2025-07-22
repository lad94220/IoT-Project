import mongoose, { Document, Schema } from 'mongoose'

interface IDeviceStatus extends Document {
  device: string;
  auto_mode: boolean;
  isOn: boolean;
}

const DeviceStatusSchema: Schema = new Schema({
  device: { type: String, required: true },
  auto_mode: { type: Boolean, required: true, default: true },
  isOn: { type: Boolean, required: true, default: false }
})

export const DeviceStatus = mongoose.model<IDeviceStatus>('DeviceStatus', DeviceStatusSchema)