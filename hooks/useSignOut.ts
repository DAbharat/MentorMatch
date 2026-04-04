"use client";

import { useClerk } from "@clerk/nextjs";

import React from 'react'
import { toast } from "sonner";

export default function useSignOut() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
        await signOut({
            redirectUrl: `/`
        })
        toast.success("Signed out successfully");
    } catch (error: any) {
        console.error("Error signing out:", error.message);
        toast.error("Failed to sign out. Please try again.");
    }
  }

  return handleSignOut;
}

