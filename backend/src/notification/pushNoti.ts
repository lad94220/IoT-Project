import axios from 'axios';
import qs from 'qs';

export async function sendPushNoti(title: string, message: string, icon: number) {
  const pushsaferKey = process.env.PUSHSAFER_KEY as string;
  try {
    const payload = qs.stringify({
      k: pushsaferKey,
      t: title,
      m: message,
      d: '',
      i: icon
    });

    const response = await axios.post(
      'https://www.pushsafer.com/api',
      payload,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  } catch (error) {
    console.error('Pushsafer error:', error);
  }
}