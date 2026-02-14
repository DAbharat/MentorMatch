import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createMentorshipRequestSchema } from "@/schema/createMentorshipRequestSchema";
import { z } from "zod";

export async function POST(req: NextRequest,
    { params }: { params: { mentorId: string } }
) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { mentorId } = params

    if (!mentorId) {
        return NextResponse.json({
            message: "Invalid parameters"
        }, {
            status: 400
        })
    }

    const body = await req.json();
    const parsed = createMentorshipRequestSchema.safeParse(body);

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const initialMessageError = tree.properties?.initialMessage?.errors || []
        const skillIdError = tree.properties?.skillId?.errors || []
        const message = [...initialMessageError, ...skillIdError].join(", ") || "Invalid input"

        return NextResponse.json({
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    const { initialMessage, skillId } = parsed.data;

    try {
        const dbUser = await prisma.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!dbUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const dbUserId = dbUser.id


        if (mentorId === dbUserId) {
            return NextResponse.json({
                message: "You cannot send a mentorship request to yourself"
            }, {
                status: 400
            })
        }

        const mentorExists = await prisma.user.findUnique({
            where: {
                id: mentorId
            },
            select: {
                id: true
            }
        })

        if (!mentorExists) {
            return NextResponse.json({
                message: "Mentor not found"
            }, {
                status: 404
            })
        }

        const skillExistsForMentor = await prisma.user.findFirst({
            where: {
                id: mentorId,
                skillsOffered: {
                    some: {
                        id: skillId
                    }
                }
            },
            select: {
                id: true
            }
        })

        if (!skillExistsForMentor) {
            return NextResponse.json(
                { message: "Invalid skill selected" },
                { status: 400 }
            )
        }

        const mentorshipRequestExists = await prisma.mentorshipRequest.findUnique({
            where: {
                mentorId_menteeId_skillId: {
                    mentorId: mentorId,
                    menteeId: dbUserId,
                    skillId: skillId
                }
            }
        })

        if (mentorshipRequestExists?.status === "PENDING") {
            return NextResponse.json({
                message: "You have already sent a mentorship request to this mentor"
            }, {
                status: 400
            })
        }

        if (mentorshipRequestExists?.status === "ACCEPTED") {
            return NextResponse.json({
                message: "You are already mentored by this mentor"
            }, {
                status: 400
            })
        }

        if (mentorshipRequestExists?.status === "REJECTED") {
            return NextResponse.json({
                message: "Your previous mentorship request was rejected"
            }, {
                status: 400
            })
        }

        const createRequest = await prisma.mentorshipRequest.create({
            data: {
                mentorId: mentorId,
                menteeId: dbUserId,
                initialMessage: initialMessage,
                skillId: skillId,
                status: "PENDING",
            }
        })

        return NextResponse.json({
            message: "Mentorship request sent successfully",
            requestId: createRequest.id
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Error creating mentorship request:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}