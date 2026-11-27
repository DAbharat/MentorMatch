"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
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
import { login } from "@/services/account.service";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success("Logged in successfully! Redirecting...");
      router.push("/profile");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      mode="sign-in"
      headline="Pick up your mentorship where you left off."
      lead="Return to your active mentorship threads, upcoming live sessions, and peer recommendations in one workspace."
      formTitle="Welcome back"
      formSubtitle="Sign in with your MentorMatch email and password."
      footer={
        <p className="text-xs sm:text-sm text-[#a8ab9e] text-center">
          New to MentorMatch?{" "}
          <Link
            href="/sign-up"
            className="text-[#b7cc7e] hover:text-[#cde099] font-medium underline underline-offset-4 decoration-[#4d5c33] hover:decoration-[#cde099] transition-colors"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label
            htmlFor="email"
            className="text-xs font-medium text-[#c7cabf] mb-1.5 block"
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
            className={authInputClassName}
            required
            disabled={isLoading}
          />
        </div>

        <AuthPasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isLoading}
        />

        <AuthErrorAlert message={error} />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold text-sm shadow-sm transition-colors mt-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
