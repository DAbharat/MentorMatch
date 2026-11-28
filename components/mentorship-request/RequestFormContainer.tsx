"use client"

import React, { useRef, useState } from 'react'
import RequestForm from './RequestForm'
import { MentorshipRequestService } from '@/services/mentorship-request.service'
import { toast } from 'sonner'

type Skill = {
    id: string
    name: string
}

type Props = {
    mentorName: string
    mentorId: string
    skills: Skill[]
    onClose: () => void
}

export default function RequestFormContainer({
    mentorName,
    mentorId,
    skills,
    onClose
}: Props) {

    const [loading, setLoading] = useState(false)
    const submissionLockRef = useRef(false)

    const handleSubmit = async (data: {
        skillId: string
        message: string
    }) => {
        if (submissionLockRef.current) return
        submissionLockRef.current = true
        setLoading(true)

        try {
            await MentorshipRequestService({
                mentorId,
                skillId: data.skillId,
                initialMessage: data.message
            })

            toast.success("Mentorship request sent successfully!")
            onClose()
        } catch (error: unknown) {
            submissionLockRef.current = false
            setLoading(false)
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to send mentorship request"
            )
        }
    }
    return (
        <RequestForm
            mentorName={mentorName}
            skills={skills}
            onSubmit={handleSubmit}
            loading={loading}
            onClose={onClose}
        />
    )
}
