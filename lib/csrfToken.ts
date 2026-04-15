import crypto from "crypto"
import { NextRequest } from "next/server"

export function generateCSRFToken() {
    return crypto.randomBytes(32).toString("hex")
}

export function verifyCSRF(req: NextRequest) {

    const cookieToken = req.cookies.get("csrfToken")?.value
    const headerToken = req.headers.get("x-csrf-token")

    if(!cookieToken || !headerToken) return false

    return cookieToken === headerToken;
}