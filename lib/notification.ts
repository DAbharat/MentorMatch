import { NotificationType } from "@prisma/client";
import prisma from "./prisma";

export async function createNotification({
    userId,
    type,
    title,
    message
} : {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
}) {
    try {
        const createNotification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message
            }
        })

        return createNotification;
        
    } catch (error) {
        throw new Error("Failed to create notification");
    }
}