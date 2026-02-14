"use client"

import React, { useState } from "react"
import {
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSet,
    Field,
    FieldLabel,
    FieldSeparator
} from "../ui/field"
import { Input } from "../ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Button } from "../retroui/Button"

type Skill = {
    id: string
    name: string
}

type Props = {
    mentorName: string
    skills: Skill[]
    onSubmit: (data: { skillId: string; message: string }) => void
    loading?: boolean
}

export default function RequestForm({
    mentorName,
    skills,
    onSubmit,
    loading = false
}: Props) {

    const [skillId, setSkillId] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({ skillId, message })
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <FieldSet>
                <FieldLegend>Mentorship Request Form</FieldLegend>
                <FieldDescription>
                    Request mentorship from {mentorName}
                </FieldDescription>

                <FieldSeparator />

                <FieldGroup>
                    <Field>
                        <FieldLabel>Mentor's Name</FieldLabel>
                        <Input value={mentorName} disabled />
                    </Field>

                    <Field>
                        <FieldLabel>Select Skill</FieldLabel>
                        <Select onValueChange={(value) => setSkillId(value)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a skill you want to learn" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Skills</SelectLabel>
                                    {skills.map((skill) => (
                                        <SelectItem key={skill.id} value={skill.id}>
                                            {skill.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <FieldSeparator />

                    <Field>
                        <FieldLabel>Message</FieldLabel>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message for the mentor here..."
                            rows={5}
                            className="resize-none"
                        />
                    </Field>

                    <div className="flex justify-center mt-6">
                        <Button type="submit" disabled={!skillId || loading}>
                            {loading ? "Sending..." : "Submit Request"}
                        </Button>
                    </div>
                </FieldGroup>
            </FieldSet>
        </form>
    )
}
