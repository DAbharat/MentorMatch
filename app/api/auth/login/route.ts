import { comparePassword, generateAccessToken, generateRefreshToken, setAuthCookies } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { isAccountLocked, recordFailedLogin, resetFailedLogin } from "@/lib/redis/auth-limiter";
import { userLoginSchema } from "@/schema/usercreationSchema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
    const body = await req.json()
    const parsed = userLoginSchema.safeParse(body)

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const emailErrors = tree.properties?.email?.errors || []
        const passwordErrors = tree.properties?.password?.errors || []
        const message = [...emailErrors, ...passwordErrors].join(", ") || "Invalid Input"

        return NextResponse.json({
            message,
        }, {
            status: 400
        })
    }

    try {
        const { email, password } = parsed.data

        const userExists = await prisma.user.findUnique({
            where: {
                email: parsed.data.email
            }
        })

        if (!userExists) {
            return NextResponse.json({
                message: "Invalid credentials."
            }, {
                status: 400
            })
        }

        const isLocked = await isAccountLocked(email)
        if(isLocked) {
            return NextResponse.json({
                message: "Account is temporarily locked due to too many failed attempts. Try again in 15 minutes."
            }, {
                status: 429
            })
        }

        const isPasswordValid = await comparePassword(password, userExists.password)

        if (!isPasswordValid) {
            const attempts = await recordFailedLogin(email)
            const remaining = Math.max(0, 5-attempts)
            const message = remaining > 0 ? `Invalid credentials. ${remaining} attempt(s) remaining.` : "Account locked due to too many failed attempts. Try again in 15 minutes."

            return NextResponse.json({
                message,
            }, {
                status: 400
            })
        }
        await resetFailedLogin(email)

        await prisma.user.update({
            where: {
                id: userExists.id
            },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date()
            }
        })

        const accessToken = generateAccessToken(userExists.id)
        const refreshToken = generateRefreshToken(userExists.id)

        await prisma.authSession.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        })

        await prisma.authSession.create({
            data: {
                userId: userExists.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            }
        })

        const response = NextResponse.json({
            message: "User logged in successfully",
            user: {
                id: userExists.id,
                email: userExists.email,
                name: userExists.name
            },
        }, {
            status: 200
        })

        setAuthCookies(response, accessToken, refreshToken)

        return response;

    } catch (error: any) {
        console.error("Error logging in user: ", error.message)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}