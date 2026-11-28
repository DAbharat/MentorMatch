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
import { Button } from "../ui/button"
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
        <div className="rounded-2xl border border-[#242a1e] bg-[#11140e] p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="w-full">
            <FieldSet className="relative">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                        <FieldLegend className="text-lg font-semibold text-[#f2f0e8]">Mentorship request</FieldLegend>
                        <FieldDescription className="mt-1 text-sm leading-relaxed text-[#a8ab9e]">
                            Request mentorship from {mentorName}
                        </FieldDescription>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#a8ab9e] transition-colors hover:bg-[#1b2116] hover:text-[#f2f0e8] active:bg-[#242a1e] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
                        aria-label="Close mentorship request form"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <FieldSeparator className="bg-[#242a1e]" />

                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="request-mentor" className="text-sm font-medium text-[#c7cabf]">Mentor&apos;s name</FieldLabel>
                        <Input id="request-mentor" value={mentorName} disabled className="auth-input h-11 rounded-xl border-[#283022] bg-[#0d0f0b] text-[#a8ab9e] disabled:cursor-not-allowed" />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="request-skill" className="text-sm font-medium text-[#c7cabf]">Select skill <span className="text-[#f4b8bc]">*</span></FieldLabel>
                        <Select onValueChange={(value) => setSkillId(value)} required>
                            <SelectTrigger id="request-skill" className="h-11 w-full rounded-xl border-[#283022] bg-[#0d0f0b] text-[#f2f0e8] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/50">
                                <SelectValue placeholder="Select a skill you want to learn" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-[#242a1e] bg-[#11140e] text-[#f2f0e8]">
                                <SelectGroup>
                                    <SelectLabel className="text-[#a8ab9e] font-medium">Skills</SelectLabel>
                                    {skills.map((skill) => (
                                        <SelectItem className="min-h-11 cursor-pointer rounded-lg text-[#c7cabf] focus:bg-[#1b2116] focus:text-[#f2f0e8]" key={skill.id} value={skill.id}>
                                            {skill.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <FieldSeparator className="bg-[#242a1e]" />

                    <Field>
                        <FieldLabel htmlFor="request-message" className="text-sm font-medium text-[#c7cabf]">Message <span className="text-[#f4b8bc]">*</span></FieldLabel>
                        <Textarea
                            id="request-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell the mentor what you want to work on."
                            rows={5}
                            required
                            minLength={10}
                            className="min-h-32 resize-y rounded-xl border-[#283022] bg-[#0d0f0b] text-[#f2f0e8] placeholder:text-[#a8ab9e] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
                        />
                        <p className="text-sm text-[#a8ab9e]">Write at least 10 characters.</p>
                    </Field>

                    <div className="mt-2">
                        <Button 
                            type="submit" 
                            disabled={!skillId || loading}
                            className="h-11 w-full cursor-pointer rounded-xl bg-[#8fa654] font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed"
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