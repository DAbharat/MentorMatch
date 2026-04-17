import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/home",
    "/search",
    "/api/users"
];

function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => pathname.startsWith(route));
}

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    console.log("Middleware: Request received for: ", pathname)

    let userId: string | null = null;
    const accessToken = req.cookies.get("accessToken")?.value

    if (accessToken) {
        try {
            const payload = verifyToken(accessToken, "access")
            userId = payload?.userId || null;
        } catch (error: any) {
            console.log("Invalid token: ", error.message)
            userId = null
        }
    }

    const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")
    if (userId && isAuthPage) {
        console.log("Middleware: Redirecting authenticated user to /profile")
        return NextResponse.redirect(new URL("/profile", req.url))
    }

    if(!userId && !isPublicRoute(pathname)) {
        console.log("Middleware: Redirecting unauthenticated users to /sign-in")
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }

    const response = NextResponse.next()
    if (userId) {
        response.headers.set("x-user-id", userId)
    }
    return response
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}