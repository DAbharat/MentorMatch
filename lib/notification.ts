import prisma from "./prisma";

export type NotificationKind =
    | "MENTORSHIP_REQUEST_RECEIVED"
    | "MENTORSHIP_REQUEST_SENT"
    | "MENTORSHIP_REQUEST_ACCEPTED"
    | "MENTORSHIP_REQUEST_REJECTED"
    | "SESSION_SCHEDULED"
    | "SESSION_CONFIRMED"
    | "SESSION_STARTED"
    | "SESSION_CANCELLED"
    | "SESSION_REMINDER"
    | "FEEDBACK_RECEIVED"
    | "FEEDBACK_SENT";

export async function createNotification({
    userId,
    senderId,
    type,
    title,
    message
} : {
    userId: string;
    senderId?: string;
    type: NotificationKind;
    title: string;
    message: string;
}) {
    try {
        console.log("Creating notification:", { userId, senderId, type, title, message });
        
        const createNotification = await prisma.notification.create({
            data: {
                userId,
                senderId,
                type,
                title,
                message
            }
        })

        console.log("Notification created successfully:", createNotification.id);
        return createNotification;
        
    } catch (error) {
        console.error("Failed to create notification:", error);
        throw new Error("Failed to create notification");
    }
}