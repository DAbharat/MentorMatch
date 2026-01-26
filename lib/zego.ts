import crypto from 'crypto';

const APP_ID = Number(process.env.ZEGOCLOUD_APP_ID)
const SERVER_SECRET = process.env.ZEGOCLOUD_SERVER_SECRET!

if(!APP_ID || !SERVER_SECRET) {
  throw new Error("ZEGOCLOUD_APP_ID or ZEGOCLOUD_SERVER_SECRET is not defined in environment variables")
}

export function generateZegoToken({
    userId,
    roomId,
    expireSeconds = 3600
}: {
    userId: string;
    roomId: string;
    expireSeconds?: number;
}) {
    const effectiveTime = Math.floor(Date.now() / 1000) + expireSeconds;

    const payload = {
        app_id: APP_ID,
        user_id: userId,
        room_id: roomId,
        expire_at: effectiveTime,
        privilege: {
            1: 1,
            2: 1,
        }
    }

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString('base64url');

    const signature = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(base64Payload)
    .digest('base64url');

    const token = `${base64Payload}.${signature}`;

    return token;
}