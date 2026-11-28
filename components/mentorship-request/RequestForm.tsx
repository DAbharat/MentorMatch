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
        <div className="p-4 sm:p-5">
            <form onSubmit={handleSubmit} className="w-full">
                <FieldSet className="relative gap-4 sm:gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <FieldLegend className="mb-0 text-lg font-semibold text-[#f2f0e8]">
                                Mentorship request
                            </FieldLegend>
                            <FieldDescription className="mt-1 text-sm leading-relaxed text-[#a8ab9e]">
                                Request mentorship from {mentorName}
                            </FieldDescription>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#a8ab9e] transition-colors hover:bg-[#1b2116] hover:text-[#f2f0e8] active:bg-[#242a1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Close mentorship request form"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    <FieldSeparator className="[&_[data-slot=separator]]:bg-[#242a1e]" />

                    <FieldGroup className="gap-4 sm:gap-5">
                        <Field className="gap-1.5">
                            <FieldLabel htmlFor="request-mentor" className="text-sm font-medium text-[#c7cabf]">
                                Mentor&apos;s name
                            </FieldLabel>
                            <Input
                                id="request-mentor"
                                value={mentorName}
                                disabled
                                className="auth-input h-11 rounded-xl border-[#283022] bg-[#0d0f0b] text-[#a8ab9e] disabled:cursor-not-allowed"
                            />
                        </Field>

                        <Field className="gap-1.5">
                            <FieldLabel htmlFor="request-skill" className="text-sm font-medium text-[#c7cabf]">
                                Select skill <span className="text-[#f4b8bc]">*</span>
                            </FieldLabel>
                            <Select onValueChange={(value) => setSkillId(value)} required>
                                <SelectTrigger
                                    id="request-skill"
                                    className="h-11 w-full rounded-xl border-[#283022] bg-[#0d0f0b] text-[#f2f0e8] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
                                >
                                    <SelectValue placeholder="Select a skill you want to learn" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-[#242a1e] bg-[#11140e] text-[#f2f0e8]">
                                    <SelectGroup>
                                        <SelectLabel className="font-medium text-[#a8ab9e]">Skills</SelectLabel>
                                        {skills.map((skill) => (
                                            <SelectItem
                                                className="min-h-11 cursor-pointer rounded-lg text-[#c7cabf] focus:bg-[#1b2116] focus:text-[#f2f0e8]"
                                                key={skill.id}
                                                value={skill.id}
                                            >
                                                {skill.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        <FieldSeparator className="[&_[data-slot=separator]]:bg-[#242a1e]" />

                        <Field className="gap-1.5">
                            <FieldLabel htmlFor="request-message" className="text-sm font-medium text-[#c7cabf]">
                                Message <span className="text-[#f4b8bc]">*</span>
                            </FieldLabel>
                            <Textarea
                                id="request-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell the mentor what you want to work on."
                                rows={4}
                                required
                                minLength={10}
                                className="min-h-24 resize-y rounded-xl border-[#283022] bg-[#0d0f0b] text-[#f2f0e8] placeholder:text-[#a8ab9e] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
                            />
                            <p className="text-xs text-[#a8ab9e]">Write at least 10 characters.</p>
                        </Field>

                        <Button
                            type="submit"
                            disabled={!skillId || loading}
                            className="h-11 w-full cursor-pointer rounded-xl bg-[#8fa654] font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Submit Request"}
                        </Button>
                    </FieldGroup>
                </FieldSet>
            </form>
        </div>
    )
}