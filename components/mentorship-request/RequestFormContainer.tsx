"use client"

import React, { useState } from 'react'
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
}

export default function RequestFormContainer({
    mentorName,
    mentorId,
    skills
}: Props) {

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (data: {
        skillId: string
        message: string
    }) => {
        try {
            setLoading(true)
            await MentorshipRequestService({
                mentorId,
                skillId: data.skillId,
                initialMessage: data.message
            })

            toast.success("Mentorship request sent successfully!")
        } catch (error) {
            toast.error("Failed to send mentorship request")
        } finally {
            setLoading(false)
        }
    }
    return (
        <RequestForm
            mentorName={mentorName}
            skills={skills}
            onSubmit={handleSubmit}
            loading={loading}
        />
    )
}
