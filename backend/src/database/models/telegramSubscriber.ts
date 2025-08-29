import mongoose, { Document, Schema } from 'mongoose';

export interface ITelegramSubscriber extends Document {
  chatId: string;
  isSubscribed: boolean;
}

const TelegramSubscriberSchema: Schema = new Schema({
    chatId: {type: String, required: true, unique: true},
    isSubscribed: {type: Boolean, required: true, default: true}
}, {timestamps: true});

export default mongoose.model<ITelegramSubscriber>('TelegramSubscriber', TelegramSubscriberSchema);