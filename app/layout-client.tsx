"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const showNavbarAndSidebar = !isLandingPage;

  return (
    <SidebarProvider>
      {showNavbarAndSidebar && <AppSidebar />}
      <div className="flex flex-col flex-1 w-full min-h-screen">
        {showNavbarAndSidebar && <Navbar />}
        <main
          className={`flex-1 ${
            showNavbarAndSidebar ? "pt-14 md:pt-16" : ""
          } bg-[#0b090a]`}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
