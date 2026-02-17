import { NotificationType } from "@prisma/client";
import prisma from "./prisma";

export async function createNotification({
    userId,
    senderId,
    type,
    title,
    message
} : {
    userId: string;
    senderId?: string;
    type: NotificationType;
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