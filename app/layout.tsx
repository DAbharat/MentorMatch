import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DM_Sans } from "next/font/google";

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
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${DM_Sans_Font.className} antialiased`}
        >
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <div className="flex flex-col flex-1 w-full min-h-screen">
                <Navbar />
                <main className="flex-1 pt-14 md:pt-16 bg-[#0b090a]">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </TooltipProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
