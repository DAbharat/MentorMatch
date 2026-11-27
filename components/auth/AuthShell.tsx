"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Eye,
  EyeOff,
  MessageSquare,
  Users,
  Video,
} from "lucide-react";
import { DM_Sans } from "next/font/google";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const authInputClassName =
  "auth-input h-11 rounded-xl bg-[#0d0f0b] border-[#283022] text-[#f2f0e8] placeholder:text-[#787d6f] caret-[#9eb660] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/25 transition-colors text-sm";

interface AuthShellProps {
  mode: "sign-in" | "sign-up";
  headline: string;
  lead: string;
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const workflowHighlights = [
  {
    icon: Users,
    text: "One account to both mentor peers and learn new skills",
  },
  {
    icon: CalendarClock,
    text: "Structured session scheduling with automated reminders",
  },
  {
    icon: Video,
    text: "Built-in real-time chat and peer-to-peer video calls",
  },
  {
    icon: MessageSquare,
    text: "Free community skill exchange without booking paywalls",
  },
];

export function AuthShell({
  mode,
  headline,
  lead,
  formTitle,
  formSubtitle,
  children,
  footer,
}: AuthShellProps) {
  const isCompact = mode === "sign-up";

  return (
    <div
      className={`min-h-screen bg-[#090a08] text-[#f2f0e8] selection:bg-[#8fa654]/30 selection:text-[#f2f0e8] flex flex-col justify-between ${
        isCompact ? "px-4 py-3.5 sm:px-8 sm:py-4" : "px-4 py-6 sm:px-8 sm:py-8"
      } ${DM_Sans_Font.className}`}
    >
      {/* Subtle olive radial atmosphere at the top edge, no heavy chrome */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_65%_50%_at_25%_0%,rgba(143,166,84,0.10),transparent_70%)]"
      />

      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 rounded-lg py-1 pr-2"
        >
          <span className="w-8 h-8 rounded-lg bg-[#161b12] border border-[#3a4530] flex items-center justify-center text-xs font-bold tracking-wider text-[#b7cc7e] group-hover:border-[#8fa654] transition-colors">
            MM
          </span>
          <span className="text-sm font-semibold tracking-tight text-[#f2f0e8]">
            MentorMatch
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a8ab9e] hover:text-[#f2f0e8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 rounded-md px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>
      </header>

      <main
        className={`relative z-10 w-full max-w-5xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-center ${
          isCompact ? "py-3 lg:py-2 gap-8 lg:gap-14" : "py-10 lg:py-14 gap-10 lg:gap-16"
        }`}
      >
        {/* Left: Minimal brand & workflow context (no preview image) */}
        <section aria-label="MentorMatch overview" className="max-w-md">
          <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1] text-[#f2f0e8]">
            {headline}
          </h1>
          <p className="mt-4 text-base text-[#a8ab9e] leading-relaxed">
            {lead}
          </p>

          <ul className="mt-8 space-y-3.5 border-t border-[#1e2419] pt-7">
            {workflowHighlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#161b12] border border-[#2a3322] text-[#9eb660]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-[#c7cabf] leading-snug">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Right: Focused form surface */}
        <section
          aria-label={mode === "sign-in" ? "Sign in form" : "Sign up form"}
          className={`w-full max-w-md lg:max-w-none mx-auto bg-[#11140e] border border-[#242a1e] rounded-2xl shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)] ${
            isCompact ? "p-5 sm:p-6" : "p-6 sm:p-8"
          }`}
        >
          {/* Compact route switch */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className={`grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0b0d09] border border-[#1f251a] ${
              isCompact ? "mb-4" : "mb-7"
            }`}
          >
            <Link
              href="/sign-in"
              role="tab"
              aria-selected={mode === "sign-in"}
              className={`text-center rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isCompact ? "py-1.5" : "py-2"
              } ${
                mode === "sign-in"
                  ? "bg-[#1b2116] text-[#f2f0e8] border border-[#323d28]"
                  : "text-[#9a9e91] hover:text-[#f2f0e8]"
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              role="tab"
              aria-selected={mode === "sign-up"}
              className={`text-center rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isCompact ? "py-1.5" : "py-2"
              } ${
                mode === "sign-up"
                  ? "bg-[#1b2116] text-[#f2f0e8] border border-[#323d28]"
                  : "text-[#9a9e91] hover:text-[#f2f0e8]"
              }`}
            >
              Create account
            </Link>
          </div>

          <div className={isCompact ? "mb-4" : "mb-6"}>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#f2f0e8]">
              {formTitle}
            </h2>
            <p className="mt-1 text-sm text-[#a8ab9e]">{formSubtitle}</p>
          </div>

          {children}

          <div
            className={`border-t border-[#1e2419] ${
              isCompact ? "mt-4 pt-3.5" : "mt-6 pt-5"
            }`}
          >
            {footer}
          </div>
        </section>
      </main>

      <footer className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#787d6f]">
        <span>© {new Date().getFullYear()} MentorMatch. All rights reserved.</span>
        <span>Peer skill-sharing for builders &amp; learners</span>
      </footer>
    </div>
  );
}

interface AuthPasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  disabled?: boolean;
  inputClassName?: string;
}

export function AuthPasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  inputClassName,
}: AuthPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Label
        htmlFor={id}
        className="text-xs font-medium text-[#c7cabf] mb-1.5 block"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${authInputClassName} pr-11 ${inputClassName ?? ""}`}
          required
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8e9484] hover:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 transition-colors cursor-pointer"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export function AuthErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Alert
      variant="destructive"
      className="rounded-xl border-[#61282d] bg-[#231214] text-[#f4b8bc]"
    >
      <AlertCircle className="h-4 w-4 text-[#eb7b83]" />
      <AlertDescription className="text-xs sm:text-sm text-[#f4b8bc]">
        {message}
      </AlertDescription>
    </Alert>
  );
}

