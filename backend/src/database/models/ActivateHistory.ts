import mongoose, { Document, Schema} from 'mongoose'

export interface IActivateHistory extends Document {
  _id: string;
  date: string;
  activate_time: Date;
  end_time: Date;
  duration: number; //second
  consumption: number; //kWh
}

const ActivateHistorySchema: Schema = new Schema({
  _id: { type: String, required: true },
  date: { type: String, ref: 'DayData', required: true },
  activate_time: { type: Date, required: true, default: Date.now },
  end_time: { type: Date, required: true, default: Date.now },
  duration: { type: Number, required: true, default: 0 },
  consumption: { type: Number, required: true, default: 0 }
})

export const ActivateHistory = mongoose.model<IActivateHistory>('ActivateHistory', ActivateHistorySchema)