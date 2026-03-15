import { useEffect, useRef, useState } from "react";

interface useCallTimerProps {
    sessionExpiresAt: string;
    onTimeUp: () => void;
}

export const useCallTimer = ({
    sessionExpiresAt,
    onTimeUp
}: useCallTimerProps) => {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
    const [showWarning, setShowWarning] = useState(false)
    const hasTimedOut = useRef(false)

    const computeRemainingSeconds = (expiresAt: number) => {
        const now = Date.now()

        const remaining = Math.floor((expiresAt - now) / 1000)

        return Math.max(remaining, 0)
    }

    useEffect(() => {
        hasTimedOut.current = false
        const expiresAt = new Date(sessionExpiresAt).getTime()

        if (isNaN(expiresAt)) {
            setRemainingSeconds(0)

            if (!hasTimedOut.current) {
                hasTimedOut.current = true
                onTimeUp()
            }

            return
        }

        const initialRemaining = computeRemainingSeconds(expiresAt)

        if (initialRemaining <= 0) {
            setRemainingSeconds(0)

            if (!hasTimedOut.current) {
                hasTimedOut.current = true
                onTimeUp()
            }
            return
        }

        setRemainingSeconds(initialRemaining)
        setShowWarning(initialRemaining <= 300)

        const interval = setInterval(() => {

            const remaining = computeRemainingSeconds(expiresAt)

            if (remaining <= 0) {
                setRemainingSeconds(0)
                setShowWarning(true)

                clearInterval(interval)

                if (!hasTimedOut.current) {
                    hasTimedOut.current = true
                    onTimeUp()
                }
                return
            }
            setRemainingSeconds(remaining)

            setShowWarning(remaining <= 300)

        }, 1000)

        return () => {
            clearInterval(interval)
        }

    }, [sessionExpiresAt, onTimeUp])

    return {
        remainingSeconds,
        showWarning
    }
}