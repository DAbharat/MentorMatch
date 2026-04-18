"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/retroui/Button";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DM_Sans } from "next/font/google";
import { toast } from "sonner";
import { register } from "@/services/account.service";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await register({ name, email, password });
      console.log("Sign-up response:", response)
      console.log("Response keys:", Object.keys(response))
      
      localStorage.setItem("userId", response.id);
      localStorage.setItem("authToken", response.accessToken);
      
      console.log("Stored in localStorage - userId:", response.id, "authToken:", response.accessToken?.substring(0, 20))
      
      toast.success("Account created successfully! Redirecting...");
      router.push("/profile");
    } catch (err: any) {
      const errorMsg = err?.message || "Signup failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#0b090a] p-3 sm:p-4 md:p-6 ${DM_Sans_Font.className}`}>
      <div className="w-full max-w-6xl bg-[#0b090a] rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 my-4">

        {/* Left: Form area */}
        <div className="bg-[#0b090a] p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="max-w-md mx-auto md:mx-0">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#d3d3d3] tracking-tight">
                Get Started Now
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 font-light">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="mb-5 sm:mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-gray-200 bg-[#111315] text-[#d3d3d3] font-medium text-sm transition-all duration-200 shadow-sm"
                disabled={isLoading}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-[#0b090a] text-gray-500 font-medium">or</span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4 sm:space-y-5">
              <div>
                <Label htmlFor="name" className="text-xs sm:text-sm text-muted-foreground font-semibold mb-1.5 sm:mb-2 block">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-[#1a1a1d] border-white/10 text-[#d3d3d3] placeholder:text-white/25 focus-visible:ring-white/20 focus-visible:border-white/30 transition-all text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm text-muted-foreground font-semibold mb-1.5 sm:mb-2 block">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-11 sm:h-12 rounded-lg sm:rounded-xl bg-[#1a1a1d] border-white/10 text-[#d3d3d3] placeholder:text-white/25 focus-visible:ring-white/20 focus-visible:border-white/30 transition-all text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-xs sm:text-sm text-muted-foreground font-semibold mb-1.5 sm:mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password"
                    className="h-11 sm:h-12 pr-11 sm:pr-12 rounded-lg sm:rounded-xl bg-[#1a1a1d] border-white/10 text-[#d3d3d3] placeholder:text-white/25 focus-visible:ring-white/20 focus-visible:border-white/30 transition-all text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Password must be at least 8 characters and contain uppercase, lowercase, and numbers
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-lg sm:rounded-xl border-red-200 bg-red-50">
                  <AlertDescription className="text-xs sm:text-sm text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 bg-[#d3d3d3] hover:bg-[#bcbcbc] text-black font-semibold text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200 mt-5 sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-xs sm:text-sm text-gray-600 text-center mt-6 sm:mt-8">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#d3d3d3] hover:text-[#bcbcbc] font-semibold">
                Sign in
              </Link>
            </p>

            <p className="text-xs text-gray-400 text-center mt-4 sm:mt-6">
              © {new Date().getFullYear()} Acme. All rights reserved
            </p>
          </div>
        </div>

        {/* Right: Promo panel */}
        <div className="hidden md:flex items-center justify-center bg-[#111315] text-white p-8 xl:p-10 relative overflow-hidden rounded-4xl">
          <div className="absolute top-0 right-0 w-72 h-72 xl:w-96 xl:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 xl:w-80 xl:h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="max-w-md text-center relative z-10">
            <h2 className="text-2xl xl:text-3xl font-bold mb-3 xl:mb-4 leading-tight">
              Find mentors. Share skills. Grow faster
            </h2>
            <p className="text-sm xl:text-base mb-6 xl:mb-8 text-indigo-100 font-light">
              Enter your credentials to access your account
            </p>

            <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl xl:rounded-2xl p-4 xl:p-6 mb-6 xl:mb-8 border border-white/20 shadow-2xl">
              <div className="h-40 xl:h-48 w-full bg-linear-to-br from-white/20 to-white/5 rounded-lg xl:rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 xl:w-16 xl:h-16 mx-auto mb-2 xl:mb-3 text-white/80" />
                  <p className="text-xs xl:text-sm font-medium text-white/90">Dashboard Preview</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 xl:gap-6 text-xs xl:text-sm text-indigo-100/80 font-medium">
              <span className="hover:text-white transition-colors cursor-default">Github</span>
              <span className="text-white/30">•</span>
              <span className="hover:text-white transition-colors cursor-default">Google</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
