import { generateAccessToken, generateRefreshToken, setAuthCookies, verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function unauthorizedResponse() {
    const response = NextResponse.json({
        message: "Unauthorized"
    }, {
        status: 401
    })
    response.cookies.delete("accessToken")
    response.cookies.delete("refreshToken")

    return response
}

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get("refreshToken")?.value
        if (!refreshToken) {
            return unauthorizedResponse()
        }

        const decoded = verifyToken(refreshToken, "refresh")
        if (!decoded) {
            return unauthorizedResponse()
        }

        const sessionExists = await prisma.authSession.findUnique({
            where: {
                refreshToken
            }
        })
        if (!sessionExists || sessionExists.userId !== decoded.userId || sessionExists.expiresAt < new Date()) {
            return unauthorizedResponse()
        }

        const newAccessToken = generateAccessToken(decoded.userId)
        const newRefreshToken = generateRefreshToken(decoded.userId)

        await prisma.authSession.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        })

        await prisma.authSession.update({
            where: {
                id: sessionExists.id
            },
            data: {
                refreshToken: newRefreshToken,
                expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            }
        })

        const response = NextResponse.json({
            message: "Token refreshed"
        })

        setAuthCookies(response, newAccessToken, newRefreshToken)

        return response
    } catch (error: any) {
        console.error("Error refreshing token", error.message)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}