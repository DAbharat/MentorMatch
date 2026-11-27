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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  CalendarDays,
  CirclePlus,
  Compass,
  Home,
  type LucideIcon,
  Search,
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

const discoveryItems: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Find mentors", url: "/search", icon: Search },
  { title: "Recommendations", url: "/recommendations", icon: Compass },
];

const mentorshipItems: NavItem[] = [
  { title: "Sessions", url: "/sessions", icon: CalendarDays },
  { title: "Requests", url: "/requests", icon: CirclePlus },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

function SidebarNavGroup({
  label,
  items,
  pathname,
  className,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  className?: string;
  onNavigate: () => void;
}) {
  return (
    <SidebarGroup className={`px-2 ${className ?? ""}`}>
      <SidebarGroupLabel className="mb-1.5 px-3 text-xs font-medium text-[#8a8f80]">
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
                  className={`h-11 rounded-xl border px-3 transition-colors ${
                    isActive
                      ? "border-[#8fa654] bg-[#1b2116] font-semibold text-[#f2f0e8] hover:bg-[#1b2116] hover:text-[#f2f0e8] data-[active=true]:bg-[#1b2116] data-[active=true]:text-[#f2f0e8]"
                      : "border-transparent bg-transparent text-[#a8ab9e] hover:bg-[#161b12] hover:text-[#f2f0e8] active:bg-[#1b2116] active:text-[#f2f0e8]"
                  }`}
                >
                  <Link
                    href={item.url}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onNavigate}
                    className={`flex min-w-0 cursor-pointer items-center gap-3 ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-[#b7cc7e]" : "text-[#9a9e91]"
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
  const { isMobile, setOpenMobile } = useSidebar();
  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar
      collapsible="icon"
      className={`top-14 bottom-0 h-[calc(100svh-3.5rem)] border-sidebar-border md:top-16 md:h-[calc(100svh-4rem)] ${DM_Sans_Font.className}`}
    >
      <SidebarHeader className="flex h-14 shrink-0 justify-center border-b border-[#242a1e] bg-sidebar px-3.5 md:hidden">
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
          onClick={handleNavigate}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3a4530] bg-[#161b12] text-xs font-bold tracking-wider text-[#b7cc7e] transition-colors group-hover:border-[#8fa654]">
            MM
          </span>
          <span className="font-semibold text-sm text-[#f2f0e8] tracking-tight group-data-[collapsible=icon]:hidden">
            MentorMatch
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar py-3">
        <SidebarNavGroup
          label="Explore"
          items={discoveryItems}
          pathname={pathname}
          onNavigate={handleNavigate}
        />
        <SidebarNavGroup
          label="Mentorship"
          items={mentorshipItems}
          pathname={pathname}
          onNavigate={handleNavigate}
          className="mt-3"
        />
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden border-t border-[#242a1e] bg-sidebar p-4">
        <div className="text-xs text-[#8a8f80]">
          © {new Date().getFullYear()} MentorMatch
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
