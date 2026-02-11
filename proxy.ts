import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)?",
    "/sign-up(.*)?",
    "/home",
    "/api/webhook/clerk",
    "/api/user/create" // Allow unauthenticated requests to this route
])


export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();
    const pathname = request.nextUrl.pathname;

    console.log("Middleware: Request received for", pathname);

    const isAuthPage =
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up")

    if (userId && isAuthPage) {
        console.log("Middleware: Redirecting authenticated user to /profile");
        return NextResponse.redirect(new URL("/profile", request.url));
    }

    if (!userId && !isPublicRoute(request)) {
        console.log("Middleware: Redirecting unauthenticated user to /sign-in");
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (!isPublicRoute(request)) {
        console.log("Middleware: Protecting route", pathname);
        await auth.protect();
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