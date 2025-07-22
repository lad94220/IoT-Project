import mongoose, { Document, Schema } from 'mongoose'

export interface ISensorData extends Document {
  activation: string;
  timestamp: Date;
  current: number;
  voltage: number;
}

const SensorDataSchema: Schema = new Schema({
  activation: { type: String, ref: 'ActivateHistory', required: true, index: true },
  timestamp: { type: Date, required: true, default: () => Date.now(), index: true },
  current: { type: Number, required: true }, // Current in Amperes
  voltage: { type: Number, required: true } // Voltage in Volts
})

export const SensorData = mongoose.model<ISensorData>('SensorData', SensorDataSchema)