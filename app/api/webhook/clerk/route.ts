export const runtime = "nodejs"

import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { NextRequest } from "next/server"


export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
    //console.log(WEBHOOK_SECRET)

    if (!WEBHOOK_SECRET) {
        return Response.json({
            message: "Webhook signing secret is not configured."
        }, {
            status: 500
        })
    }

    const headerPayload = await headers()

    const svix_id = headerPayload.get("svix-id") ?? req.headers.get("svix-id") ?? req.headers.get("Svix-Id")
    const svix_timestamp = headerPayload.get("svix-timestamp") ?? req.headers.get("svix-timestamp") ?? req.headers.get("Svix-Timestamp")
    const svix_signature = headerPayload.get("svix-signature") ?? req.headers.get("svix-signature") ?? req.headers.get("Svix-Signature")

    // try {
    //     console.log("Incoming Svix headers (headers()):", Object.fromEntries(headerPayload.entries()))
    // } catch (err) {
    //     console.log("Incoming Svix headers: could not enumerate headers()", err)
    // }
    // console.log("Fallback req.headers.get svix-id:", req.headers.get("svix-id"))
    // console.log("Resolved svix_id, svix_timestamp, svix_signature:", { svix_id, svix_timestamp, svix_signature })

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing required Svix headers. Aborting webhook verification.")
        return Response.json({
            message: "Missing Svix headers."
        }, {
            status: 400
        })
    }

    const payload = await req.text()

    const webhook = new Webhook(WEBHOOK_SECRET)

    let event: WebhookEvent

    try {
        event = webhook.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }) as WebhookEvent
    } catch (error) {
        console.error("Error verifying webhook:", error)
        return Response.json({
            message: "Invalid webhook signature."
        }, {
            status: 400
        })
    }

    const { id } = event.data
    const eventType = event.type

    console.log("EVENT TYPE:", event.type)


    if (eventType === "user.created") {
        try {
            const { email_addresses, primary_email_address_id } = event.data
            const primaryEmail =
                email_addresses.find(e => e.id === primary_email_address_id)
                ?? email_addresses[0]

            if (!email_addresses?.length) {
                console.warn("No email in webhook, skipping user creation")
                return Response.json({ skipped: true }, { status: 200 })
            }

            if (!primaryEmail) {
                return Response.json({
                    message: "Primary email not found.",
                    email_addresses
                }, {
                    status: 400
                })
            }

            console.log("EVENT DATA ID:", event.data.id)

            const createUser = await prisma.user.create({
                data: {
                    id: event.data.id,
                    email: primaryEmail.email_address,
                    name: event.data.first_name || "Clerk User",
                }
            })

            return Response.json({
                message: "User created successfully.",
                data: createUser
            }, {
                status: 200
            })
        } catch (error) {
            console.error("Error creating user:", error)
            return Response.json({
                message: "Error creating user."
            }, {
                status: 500
            })
        }
    }

    return Response.json({
        message: "Webhook received successfully.",
        eventType,
    }, {
        status: 200
    })
}