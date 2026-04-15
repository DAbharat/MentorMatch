import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DM_Sans } from "next/font/google";
import { RootLayoutClient } from "./layout-client";

const DM_Sans_Font = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MentorMatch - Learn from Experts, Share Your Skills",
  description: "Connect with mentors and learners in your community. Schedule live sessions, share knowledge, and grow together through real-time collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${DM_Sans_Font.className} antialiased`}
      >
        <TooltipProvider>
          <RootLayoutClient>{children}</RootLayoutClient>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
