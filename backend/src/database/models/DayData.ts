import mongoose, { Document, Schema } from 'mongoose'

export interface IDayData extends Document {
  _id: string;
  date: Date;
  total_consumption: number;
  total_activation: number;
}

const DayDataSchema: Schema = new Schema({
  _id: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  total_consumption: { type: Number, required: true, default: 0 },
  total_activation: { type: Number, required: true, default: 0 }
})

export const DayData = mongoose.model<IDayData>('DayData', DayDataSchema)