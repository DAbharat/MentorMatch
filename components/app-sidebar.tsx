"use client";

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
} from "@/components/ui/sidebar";
import {
  BarChart3,
  CirclePlus,
  HandHelping,
  Home,
  type LucideIcon,
  MessageCircleQuestionMark,
  Settings,
  Sparkles,
  Video,
} from "lucide-react";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { usePathname } from "next/navigation";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const generalItems: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { title: "Sessions", url: "/sessions", icon: Video },
  { title: "Requests", url: "/requests", icon: CirclePlus },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const helpItems: NavItem[] = [
  { title: "Support", url: "/support", icon: MessageCircleQuestionMark },
  { title: "Help Center", url: "/help", icon: HandHelping },
];

const accountItems: NavItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
];

function SidebarNavGroup({
  label,
  items,
  pathname,
  className,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  className?: string;
}) {
  return (
    <SidebarGroup className={`px-2 ${className ?? ""}`}>
      <SidebarGroupLabel className="px-3 mb-1.5 text-[11px] font-semibold text-[#787d6f] uppercase tracking-wider">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === "/"
                ? pathname === "/"
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={`h-10 px-3 rounded-xl border transition-colors ${
                    isActive
                      ? "bg-[#1b2116] text-[#f2f0e8] border-[#323d28] hover:bg-[#1b2116] hover:text-[#f2f0e8] data-[active=true]:bg-[#1b2116] data-[active=true]:text-[#f2f0e8]"
                      : "bg-transparent text-[#a8ab9e] border-transparent hover:bg-[#161b12] hover:text-[#f2f0e8] active:bg-[#1b2116] active:text-[#f2f0e8]"
                  }`}
                >
                  <Link href={item.url} className="flex items-center gap-3 font-medium">
                    <item.icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-[#b7cc7e]" : "text-[#8e9484]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className={`border-r border-[#1e2419] bg-[#090a08] text-[#f2f0e8] ${DM_Sans_Font.className}`}
    >
      <SidebarHeader className="bg-[#090a08] h-14 md:h-16 border-b border-[#1e2419] flex justify-center px-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
        >
          <span className="w-8 h-8 shrink-0 rounded-lg bg-[#161b12] border border-[#3a4530] flex items-center justify-center text-xs font-bold tracking-wider text-[#b7cc7e] group-hover:border-[#8fa654] transition-colors">
            MM
          </span>
          <span className="font-semibold text-sm text-[#f2f0e8] tracking-tight group-data-[collapsible=icon]:hidden">
            MentorMatch
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-3 bg-[#090a08]">
        <SidebarNavGroup
          label="General"
          items={generalItems}
          pathname={pathname}
        />
        <SidebarNavGroup
          label="Help"
          items={helpItems}
          pathname={pathname}
          className="mt-3"
        />
        <SidebarNavGroup
          label="Account"
          items={accountItems}
          pathname={pathname}
          className="mt-3"
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-[#1e2419] p-4 bg-[#090a08] group-data-[collapsible=icon]:hidden">
        <div className="text-xs text-[#787d6f]">
          © {new Date().getFullYear()} MentorMatch
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
