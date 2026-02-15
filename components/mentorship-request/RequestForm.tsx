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
import { X } from "lucide-react"

type Skill = {
    id: string
    name: string
}

type Props = {
    mentorName: string
    skills: Skill[]
    onSubmit: (data: { skillId: string; message: string }) => void
    loading?: boolean
    onClose: () => void
}

export default function RequestForm({
    mentorName,
    skills,
    onSubmit,
    loading = false,
    onClose
}: Props) {

    const [skillId, setSkillId] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({ skillId, message })
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <FieldSet className="relative">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                        <FieldLegend>Mentorship Request Form</FieldLegend>
                        <FieldDescription className="mt-1">
                            Request mentorship from {mentorName}
                        </FieldDescription>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="shrink-0 p-1 hover:opacity-70 transition-opacity cursor-pointer"
                        aria-label="Close form"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

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
                        <Button 
                            type="submit" 
                            disabled={!skillId || loading}
                            className="min-w-45"
                        >
                            {loading ? "Sending..." : "Submit Request"}
                        </Button>
                    </div>
                </FieldGroup>
            </FieldSet>
        </form>
    )
}