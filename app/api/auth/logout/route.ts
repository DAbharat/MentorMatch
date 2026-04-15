import { verifyToken } from "@/lib/auth";
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
    
        await prisma.authSession.deleteMany({
            where: {
                userId: decoded.userId
            }
        })
        console.log(`User ${decoded.userId} logged out at ${new Date().toISOString()}`)
    
        const response = NextResponse.json({
            message: "Logged out successfully"
        })
    
        response.cookies.delete("refreshToken")
        response.cookies.delete("accessToken")
        response.cookies.delete("csrfToken")
    
        return response

    } catch (error: any) {
        console.error("Error logging out user: ", error.message)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}