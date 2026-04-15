import { userRegisterSchema } from "@/schema/usercreationSchema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "./prisma";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateCSRFToken } from "./csrfToken";


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!


export async function register(req: NextRequest): Promise<NextResponse> {
    const body = await req.json()
    const parsed = userRegisterSchema.safeParse(body);

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const nameErrors = tree.properties?.name?.errors || []
        const emailErrors = tree.properties?.email?.errors || []
        const passwordErrors = tree.properties?.password?.errors || []
        const message = [...nameErrors, ...emailErrors, ...passwordErrors].join(", ") || "Invalid Input"

        return NextResponse.json({
            message
        }, {
            status: 400
        })
    }

    try {
        const { name, email, password } = parsed.data

        if (!name || !email || !password) {
            return NextResponse.json({
                message: "Missing required fields: NAME, EMAIL, PASSWORD"
            }, {
                status: 400
            })
        }

        const userExists = await prisma.user.findUnique({
            where: {
                email: parsed.data.email
            },
            select: {
                id: true,
                name: true
            }
        })

        if (userExists) {
            return NextResponse.json({
                message: "Invalid credentials.",
                data: userExists
            }, {
                status: 400
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const createuser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        const accessToken = generateAccessToken(createuser.id)
        const refreshToken = generateRefreshToken(createuser.id)

        await prisma.authSession.create({
            data: {
                userId: createuser.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            }
        })

        const res = NextResponse.json({
            message: "User registered successfully.",
            user: {
                id: createuser.id,
                name: createuser.name,
                email: createuser.email
            }
        })

        setAuthCookies(res, accessToken, refreshToken)

        return res;

    } catch (error: any) {
        console.error("Error creating user:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({
                message: `Unique constraint violation: A user with this ${error.meta.target} already exists.`
            }, {
                status: 400
            });
        }
        return NextResponse.json({
            message: "An error occurred while creating the user."
        }, {
            status: 500
        })
    }
}

export function generateAccessToken(userId: string): string {
    return jwt.sign({
        userId
    }, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({
        userId
    }, REFRESH_TOKEN_SECRET, {
        expiresIn: "10d"
    })
}

export function verifyToken(token: string, type: "access" | "refresh"): { userId: string } | null {
    try {

        const secret = type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET
        const decoded = jwt.verify(token, secret) as { userId: string }

        return decoded
    } catch (error) {
        return null
    }
}

export function setAuthCookies(res: NextResponse, accessToken: string, refreshToken: string): void {
    res.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60
    })

    res.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 10 * 24 * 60 * 60 * 1000
    })

    const csrfToken = generateCSRFToken()

    res.cookies.set("csrfToken", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        path: "/"
    })
}

export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return await bcrypt.compare(password, hash)
}

export function getSessionFromRequest(req: NextRequest): string | null {

    const accessToken = req.cookies.get("accessToken")?.value
    const refreshToken = req.cookies.get("refreshToken")?.value

    if(accessToken) {
        const decoded = verifyToken(accessToken, "access")
        if(decoded) {
            return decoded.userId
        }
    }

    if(refreshToken) {
        const decoded = verifyToken(refreshToken, "refresh")
        if(decoded) {
            return decoded.userId
        }
    }

    return null
}