import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)?",
    "/sign-up(.*)?",
    "/home",
    "/api/webhook/clerk"
])


export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth()
    const isPageRequest = !request.nextUrl.pathname.startsWith("/api")

    const isAuthPage =
        request.nextUrl.pathname.startsWith("/sign-in") ||
        request.nextUrl.pathname.startsWith("/sign-up")

    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    const isAccessingHome = request.nextUrl.pathname === "/home"

    if (userId && isAuthPage) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    if (!userId && !isPublicRoute(request)) {
        return NextResponse.redirect(new URL("/sign-in", request.url))
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}