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
        <div className="bg-[#161a1d]">
            <form onSubmit={handleSubmit} className="w-full">
            <FieldSet className="relative">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                        <FieldLegend className="text-[#d3d3d3]">Mentorship Request Form</FieldLegend>
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
                        <X className="w-5 h-5 text-[#d3d3d3]" />
                    </button>
                </div>

                <FieldSeparator />

                <FieldGroup>
                    <Field>
                        <FieldLabel className="text-[#d3d3d3]">Mentor's Name</FieldLabel>
                        <Input value={mentorName} disabled className="text-muted-foreground" />
                    </Field>

                    <Field>
                        <FieldLabel className="text-[#d3d3d3]">Select Skill <p className="text-red-700">*</p></FieldLabel>
                        <Select onValueChange={(value) => setSkillId(value)} required>
                            <SelectTrigger className="text-[#d3d3d3]">
                                <SelectValue placeholder="Select a skill you want to learn" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#161a1d]">
                                <SelectGroup>
                                    <SelectLabel className="text-[#d3d3d3] font-bold">Skills</SelectLabel>
                                    {skills.map((skill) => (
                                        <SelectItem className="text-muted-foreground" key={skill.id} value={skill.id}>
                                            {skill.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <FieldSeparator />

                    <Field>
                        <FieldLabel className="text-[#d3d3d3]">Message <p className="text-red-700">*</p></FieldLabel>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message for the mentor here..."
                            rows={5}
                            className="resize-none text-[#d3d3d3] placeholder:text-gray-500"
                        />
                        <p className="text-sm text-muted-foreground">Message must be at least 10 characters long.</p>
                    </Field>

                    <div className="flex justify-center mt-6">
                        <Button 
                            type="submit" 
                            disabled={!skillId || loading}
                            className="min-w-45 rounded-full bg-white text-black"
                        >
                            {loading ? "Sending..." : "Submit Request"}
                        </Button>
                    </div>
                </FieldGroup>
            </FieldSet>
        </form>
        </div>
    )
}