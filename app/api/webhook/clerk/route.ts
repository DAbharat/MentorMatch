export const runtime = "nodejs"

import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"


export async function POST(req: NextRequest) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        return NextResponse.json({
            message: "Webhook signing secret is not configured."
        }, {
            status: 500
        })
    }

    const headerPayload = await headers()

    const svix_id = headerPayload.get("svix-id") ?? req.headers.get("svix-id") ?? req.headers.get("Svix-Id")
    const svix_timestamp = headerPayload.get("svix-timestamp") ?? req.headers.get("svix-timestamp") ?? req.headers.get("Svix-Timestamp")
    const svix_signature = headerPayload.get("svix-signature") ?? req.headers.get("svix-signature") ?? req.headers.get("Svix-Signature")

    const safeSvixId = svix_id as string;
    const safeSvixTimestamp = svix_timestamp as string;
    const safeSvixSignature = svix_signature as string;

    // try {
    //     console.log("Incoming Svix headers (headers()):", Object.fromEntries(headerPayload.entries()))
    // } catch (err) {
    //     console.log("Incoming Svix headers: could not enumerate headers()", err)
    // }
    // console.log("Fallback req.headers.get svix-id:", req.headers.get("svix-id"))
    // console.log("Resolved safeSvixId, svix_timestamp, svix_signature:", { safeSvixId, svix_timestamp, svix_signature })

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing required Svix headers. Aborting webhook verification.")
        return NextResponse.json({
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
            "svix-id": safeSvixId,
            "svix-timestamp": safeSvixTimestamp,
            "svix-signature": safeSvixSignature
        }) as WebhookEvent
    } catch (error) {
        console.error("Error verifying webhook:", error)
        return NextResponse.json({
            message: "Invalid webhook signature."
        }, {
            status: 400
        })
    }

    const { id } = event.data
    const eventType = event.type

    console.log("EVENT TYPE:", event.type)


    async function logWebhook(status: "SUCCESS" | "SKIPPED" | "FAILED") {
        try {
            await prisma.webhookLog.create({
                data: {
                    id: crypto.randomUUID(),
                    status,
                    svixId: safeSvixId,
                    eventType,
                    eventData: JSON.parse(JSON.stringify(event.data))
                }
            }
            )

        } catch (error: any) {
            if (error.code === "P2002") {
                console.warn("Duplicate Svix ID detected when logging webhook. This likely means the same webhook event was processed more than once. Svix ID:", safeSvixId)
                return
            }
            console.error("Failed to log webhook event with Svix ID:", safeSvixId, "Error:", error.message)
        }
    }

    if (eventType === "user.created") {

        try {

            const alreadyProcessed = await prisma.webhookLog.findUnique({
                where: {
                    svixId: safeSvixId
                }
            })
            if (alreadyProcessed) {
                return NextResponse.json({
                    skipped: true,
                    idempotent: true,
                    message: "This webhook event has already been processed.",
                    svixId: safeSvixId
                }, {
                    status: 200
                })
            }

            const { email_addresses, primary_email_address_id } = event.data
            const primaryEmail =
                email_addresses.find(e => e.id === primary_email_address_id)
                ?? email_addresses[0]

            if (!email_addresses?.length) {
                await logWebhook("SKIPPED")
                console.warn("No email in webhook, skipping user creation")
                return NextResponse.json({ 
                    skipped: true 
                }, { 
                    status: 200 
                })
            }

            if (!primaryEmail) {
                await logWebhook("SKIPPED")
                return NextResponse.json({
                    skipped: true,
                    message: "Primary email not found.",
                    email_addresses
                }, {
                    status: 200
                })
            }

            console.log("EVENT DATA ID:", event.data.id)

            const normalizedEmail = primaryEmail.email_address.toLowerCase().trim()
            const normalizedName = ((event.data.first_name || "").trim() + " " + (event.data.last_name || "").trim()).trim()

            if (primaryEmail.verification?.status !== "verified") {
                await logWebhook("SKIPPED")
                return NextResponse.json({
                    skipped: true,
                    message: "Primary email is not verified. User not created.",
                    email: primaryEmail.email_address,
                    verificationStatus: primaryEmail.verification?.status
                }, {
                    status: 200
                })
            }

            const existingUserEmail = await prisma.user.findUnique({
                where: {
                    email: normalizedEmail
                },
                select: {
                    id: true,
                    email: true,
                    clerkUserId: true
                }
            })

            if (existingUserEmail) {
                if (existingUserEmail.clerkUserId && existingUserEmail.clerkUserId !== event.data.id) {

                    await logWebhook("SKIPPED")
                    console.error("Email already associated with another Clerk user. Skipping user creation.", {
                        email: existingUserEmail.email,
                        existingClerkUserId: existingUserEmail.clerkUserId,
                        incomingClerkUserId: event.data.id
                    })

                    return NextResponse.json({
                        skipped: true,
                        message: "Email already associated with another Clerk user.",
                        email: existingUserEmail.email,
                        existingClerkUserId: existingUserEmail.clerkUserId,
                        incomingClerkUserId: event.data.id
                    }, {
                        status: 200
                    })

                }

                if (!existingUserEmail.clerkUserId) {
                    const updateUser = await prisma.user.update({
                        where: {
                            id: existingUserEmail.id
                        },
                        data: {
                            clerkUserId: event.data.id,
                        }
                    })
                    console.log("User updated successfully:", updateUser)

                    await logWebhook("SUCCESS")
                    return NextResponse.json({
                        message: "User updated successfully.",
                        data: updateUser
                    }, {
                        status: 200
                    })
                }

                await logWebhook("SUCCESS")
                return NextResponse.json({
                    skipped: true,
                    message: "User with this email already exists and is linked to the same Clerk user.",
                    email: existingUserEmail.email,
                    clerkUserId: existingUserEmail.clerkUserId
                }, {
                    status: 200
                })

            } else {
                const createUser = await prisma.user.create({
                    data: {
                        id: crypto.randomUUID(),
                        clerkUserId: event.data.id,
                        email: normalizedEmail,
                        name: normalizedName || "Unnamed User"
                    }
                })

                console.log("User created successfully:", createUser)
                await logWebhook("SUCCESS")

                return NextResponse.json({
                    message: "User created successfully.",
                    data: createUser
                }, {
                    status: 200
                })
            }

        } catch (error: any) {

            console.error("Error creating user:", error.message)

            try {
                await prisma.webhookLog.create({
                    data: {
                        id: crypto.randomUUID(),
                        svixId: safeSvixId,
                        eventType,
                        eventData: JSON.parse(JSON.stringify(event.data)),
                        status: "FAILED"
                    }
                })
            } catch { }

            return NextResponse.json({
                message: "Internal Server Error."
            }, {
                status: 500
            })
        }
    }

    return NextResponse.json({
        skipped: true,
        message: "Webhook received successfully.",
        eventType,
    }, {
        status: 200
    })

}
