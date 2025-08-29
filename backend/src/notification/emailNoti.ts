import { Resend } from 'resend';
import User from '../database/models/User';

const resendToken = process.env.RESEND_TOKEN as string;

export const resend = new Resend(resendToken);

export enum EmailSignal {
  Welcome,
  DeviceReconnected,
  DeviceDisconnected,
  LightOn,
  LightOff
}

export async function sendEmail(signal: EmailSignal) {
  try {
    const users = await User.find({}, 'email').exec();
    const userEmails = users.map(user => user.email);

    if (userEmails.length === 0) {
      console.log('No users found to send email to');
      return;
    }
    let message: string = "";
    let subject: string = "";
    
    switch (signal) {
        case EmailSignal.Welcome:
            subject = "Lời chào";
            message = `Chào mừng với thiết bị IoT Đèn Thông Minh!<br>
            Cài đặt app PushSafer và quét mã sau để nhận thông báo đẩy.<br><br>
            <img src="https://i.ibb.co/TMFYxGxq/image.png" alt="QR Code" width="200">`;
            break;
        case EmailSignal.DeviceReconnected:
            subject = "Trạng thái kết nối";
            message = "Thiết bị đã kết nối lại";
            break;
        case EmailSignal.DeviceDisconnected:
            subject = "Trạng thái kết nối";
            message = "Thiết bị đã mất kết nối";
            break;
        case EmailSignal.LightOn:
            subject = "Trạng thái đèn";
            message = "Đèn bật";
            break;
        case EmailSignal.LightOff:
            subject = "Trạng thái đèn";
            message = "Đèn tắt";
            break;
    }

    const batchEmails = userEmails.map(email => ({
      from: 'iot@thinhduyng.me',
      to: email,
      subject: subject,
      html: `<p>${message}</p>`,
    }));

    const result = await resend.batch.send(batchEmails);

    return result;
  } catch (error) {
    console.error('Email sending error:', error);
  }
}