import prisma from "./prisma"

export async function computeSessionMetrices(sessionId: string) {
    try {
        const fetchSession = await prisma.session.findUnique({
            where: { id: sessionId }
        })

        if (!fetchSession || !fetchSession.callStartedAt) {
            return null
        }

        if (
            fetchSession.metricsComputedAt &&
            fetchSession.mentorActiveMinutes !== null &&
            fetchSession.menteeActiveMinutes !== null &&
            fetchSession.totalActiveMinutes !== null
        ) {
            return {
                mentorActiveMinutes: fetchSession.mentorActiveMinutes,
                menteeActiveMinutes: fetchSession.menteeActiveMinutes,
                totalActiveMinutes: fetchSession.totalActiveMinutes,
                startedAt: fetchSession.callStartedAt,
                endedAt: fetchSession.callEndedAt,
                now: new Date()
            }
        }

        const fetchCallEventsForASession = await prisma.callEvent.findMany({
            where: {
                sessionId: sessionId
            },
            orderBy: {
                timestamp: 'asc'
            }
        })

        const now = new Date()

        let mentorActiveMs = 0
        let menteeActiveMs = 0

        const mentorLastJoin: { time: Date | null } = { time: null }
        const menteeLastJoin: { time: Date | null } = { time: null }

        for (const event of fetchCallEventsForASession) {
            const isMentor = event.userId === fetchSession.mentorId
            const isMentee = event.userId === fetchSession.menteeId
            let tracker: { time: Date | null } | null = null

            if (isMentor) {
                tracker = mentorLastJoin
            } else if (isMentee) {
                tracker = menteeLastJoin
            } else {
                continue
            }

            if (event.eventType === "JOINED" && tracker.time === null) {
                tracker.time = event.timestamp
            }

            if (event.eventType === "LEFT" || event.eventType === "DISCONNECTED") {
                if (tracker.time) {
                    const timeDifference = event.timestamp.getTime() - tracker.time.getTime()
                    isMentor
                        ? (mentorActiveMs += timeDifference)
                        : (menteeActiveMs += timeDifference)
                    tracker.time = null
                }
            }
        }

        if (mentorLastJoin.time) {
            mentorActiveMs += now.getTime() - mentorLastJoin.time.getTime()
        }

        if (menteeLastJoin.time) {
            menteeActiveMs += now.getTime() - menteeLastJoin.time.getTime()
        }

        const mentorActiveMinutes = Math.ceil(mentorActiveMs / 60000)
        const menteeActiveMinutes = Math.ceil(menteeActiveMs / 60000)

        const totalActiveMinutes = Math.min(mentorActiveMinutes, menteeActiveMinutes)

        return {
            mentorActiveMinutes,
            menteeActiveMinutes,
            totalActiveMinutes,
            startedAt: fetchSession.callStartedAt,
            endedAt: fetchSession.callEndedAt || null,
            now: now
        }

    } catch (error) {
        console.error("Error computing session metrics:", error)
        return null
    }
}

export function shouldAutoCompleteSession(metrics: {
    totalActiveMinutes: number
}) {
    const { totalActiveMinutes } = metrics
    return totalActiveMinutes >= 30
}

export function canMentorManuallyCompleteSession(metrics: {
    totalActiveMinutes: number
}) {
    const { totalActiveMinutes } = metrics
    return totalActiveMinutes >= 15
}
