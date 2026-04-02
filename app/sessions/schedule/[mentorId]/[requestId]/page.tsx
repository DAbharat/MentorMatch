"use client"

import { useRouter } from "next/navigation"
import ScheduleSession from "@/components/sessions/ScheduleSession"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"
import { createSession } from "@/services/session.service"
import { fetchUserById, fetchMyProfile } from "@/services/profile.service"
import { getMentorshipRequestById } from "@/services/mentorship-request.service"
import { DM_Sans } from "next/font/google"

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type MentorInfo = {
    id: string
    name: string
    clerkUserId: string
    skillsOffered: { id: string; name: string }[]
}

type PageProps = {
    params: Promise<{ 
        mentorId: string;
        requestId: string;
    }>
}

export default function ScheduleSessionPage({ params }: PageProps) {
    const { mentorId, requestId } = use(params)
    const router = useRouter()

    const [mentor, setMentor] = useState<MentorInfo | null>(null)
    const [mentorshipRequestSkillId, setMentorshipRequestSkillId] = useState<string | null>(null)
    const [mentorshipRequestSkillName, setMentorshipRequestSkillName] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!mentorId) {
            toast.error("Mentor ID is required")
            router.push("/notifications")
            return
        }

        const loadMentor = async () => {
            try {
                setLoading(true)
                const response = await fetchUserById({ clerkUserId: mentorId })
                
                if (!response?.data) {
                    throw new Error("Failed to load mentor information")
                }
                
                setMentor(response.data)

                const currentUser = await fetchMyProfile()
                
                if (!currentUser?.id) {
                    throw new Error("Failed to load user profile")
                }
                
                const mentorshipData = await getMentorshipRequestById(requestId)
                
                if (mentorshipData?.data?.skill) {
                    setMentorshipRequestSkillId(mentorshipData.data.skill.id)
                    setMentorshipRequestSkillName(mentorshipData.data.skill.name)
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to load mentor info")
                router.push("/notifications")
            } finally {
                setLoading(false)
            }
        }

        loadMentor()
    }, [mentorId, router])

    const handleSubmit = async (formData: {
        skillId: string
        scheduledAt: string
        totalCallDuration: number
    }) => {
        if (!mentor) return

        if (!formData.skillId || !formData.scheduledAt) {
            toast.error("Please fill all required fields")
            return
        }

        const selectedDate = new Date(formData.scheduledAt)
        if (selectedDate <= new Date()) {
            toast.error("Please select a future date and time")
            return
        }

        try {
            const currentUserResponse = await fetchMyProfile()

            const sessionData = {
                mentorId: mentor.id,
                menteeId: currentUserResponse.id,
                skillId: formData.skillId,
                mentorshipRequestId: requestId,
                scheduledAt: new Date(formData.scheduledAt).toISOString(),
                totalCallDuration: formData.totalCallDuration
            }

            await createSession(sessionData)
            toast.success("Session request sent successfully!")
            
            setTimeout(() => {
                router.push("/sessions")
            }, 800)
        } catch (error: any) {
            toast.error(error.message || "Failed to schedule session")
        }
    }

    const handleCancel = () => {
        router.back()
    }

    if (!mentorId || (!mentor && !loading)) {
        return null
    }

    if (!mentor) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className={`${DM_Sans_Font.className} text-muted-foreground`}>Loading...</p>
            </div>
        )
    }

    return (
        <ScheduleSession
            mentor={mentor}
            mentorshipRequestSkillId={mentorshipRequestSkillId}
            mentorshipRequestSkillName={mentorshipRequestSkillName}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    )
}
