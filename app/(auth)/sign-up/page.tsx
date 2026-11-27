"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthErrorAlert,
  AuthPasswordInput,
  AuthShell,
  authInputClassName,
} from "@/components/auth/AuthShell";
import { register } from "@/services/account.service";

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = [
    { label: "3+ characters", met: password.trim().length >= 3 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register({ name, email, password });
      toast.success("Account created successfully! Redirecting...");
      router.push("/profile");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Signup failed. Please review your details and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      mode="sign-up"
      headline="Build alongside peers who teach what they ship."
      lead="Create one MentorMatch profile to offer skills you know, book live sessions with mentors, and collaborate in real time."
      formTitle="Create your account"
      formSubtitle="Join the community in under a minute."
      footer={
        <p className="text-xs sm:text-sm text-[#a8ab9e] text-center">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-[#b7cc7e] hover:text-[#cde099] font-medium underline underline-offset-4 decoration-[#4d5c33] hover:decoration-[#cde099] transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label
            htmlFor="name"
            className="text-xs font-medium text-[#c7cabf] mb-1 block"
          >
            Full name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            autoComplete="name"
            className={`${authInputClassName} h-10`}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label
            htmlFor="email"
            className="text-xs font-medium text-[#c7cabf] mb-1 block"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={`${authInputClassName} h-10`}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <AuthPasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Create a strong password"
            autoComplete="new-password"
            inputClassName="h-10"
            disabled={isLoading}
          />

          <ul
            aria-label="Password requirements"
            className="mt-2 flex flex-wrap gap-x-3 gap-y-1"
          >
            {passwordChecks.map(({ label, met }) => (
              <li
                key={label}
                className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                  met ? "text-[#b7cc7e]" : "text-[#8a8f80]"
                }`}
              >
                <span
                  className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors ${
                    met
                      ? "bg-[#8fa654]/20 border-[#8fa654] text-[#b7cc7e]"
                      : "border-[#31382a] text-transparent"
                  }`}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <AuthErrorAlert message={error} />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-xl bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold text-sm shadow-sm transition-colors mt-1 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
