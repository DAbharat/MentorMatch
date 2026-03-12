"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CirclePlus, HandHelping, Home, MessageCircleQuestionMark, Settings, Video } from "lucide-react"
import Link from "next/link"
import { DM_Sans } from "next/font/google";
import { usePathname } from "next/navigation";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

export function AppSidebar() {

    const pathname = usePathname()

    const items = [
        {
            title: "Home",
            url: "/",
            icon: Home
        },
        {
            title: "Sessions",
            url: "/sessions",
            icon: Video
        },
        {
            title: "Requests",
            url: "/requests",
            icon: CirclePlus
        }
    ]

    const helpActions = [
        {
            title: "Support",
            url: "/support",
            icon: MessageCircleQuestionMark
        },
        {
            title: "Help Center",
            url: "/help",
            icon: HandHelping
        }
    ]

    const accountActions = [
        {
            title: "Settings",
            url: "/settings",
            icon: Settings
        }
    ]

  return (
    <Sidebar collapsible="icon" className={`border-r border-[#1f1f1f] ${DM_Sans_Font.className}`}>
      <SidebarHeader className="bg-[#0b090a] h-14 sm:h-16 border-b border-[#1f1f1f] flex items-center px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#d3d3d3] rounded-full flex items-center justify-center shadow-sm">
            <span className="text-black font-bold text-xs">MM</span>
          </div>
          <span className="font-semibold text-[#d3d3d3] group-data-[collapsible=icon]:hidden">MentorMatch</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2 bg-[#0b090a]">
        {/* Main Navigation - No Label */}
        <SidebarGroup className="px-2">
            <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="h-10 px-3">
                      <Link href={item.url} className={`flex items-center gap-3 font-medium hover:font-bold hover:bg-transparent hover:text-white text-[#d3d3d3] ${
                        isActive ? "bg-[#161a1d] text-white" : ""
                      }`}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Help Section */}
        <SidebarGroup className="px-2 mt-4">
          <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Help
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpActions.map((helpAction) => {
                const isActive = pathname === helpAction.url
                return (
                  <SidebarMenuItem key={helpAction.title}>
                    <SidebarMenuButton asChild tooltip={helpAction.title} className="h-10 px-3">
                      <Link href={helpAction.url} className={`flex items-center gap-3 font-medium hover:font-bold hover:bg-transparent hover:text-white text-[#d3d3d3] ${
                        isActive ? "bg-[#161a1d] text-white" : ""
                      }`}>
                        <helpAction.icon className="h-5 w-5 shrink-0" />
                        <span>{helpAction.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Section */}
        <SidebarGroup className="px-2 mt-4">
          <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountActions.map((accountAction) => {
                const isActive = pathname === accountAction.url
                return (
                  <SidebarMenuItem key={accountAction.title}>
                    <SidebarMenuButton asChild tooltip={accountAction.title} className="h-10 px-3">
                      <Link href={accountAction.url} className={`flex items-center gap-3 font-medium hover:font-bold hover:bg-transparent hover:text-white text-[#d3d3d3] ${
                        isActive ? "bg-[#161a1d] text-white" : ""
                      }`}>
                        <accountAction.icon className="h-5 w-5 shrink-0" />
                        <span>{accountAction.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#1f1f1f] p-4 bg-[#0b090a]">
        <div className="text-xs text-muted-foreground">
          © 2026 MentorMatch
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}