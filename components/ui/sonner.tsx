"use client"

import type { CSSProperties } from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#6ee7b7]" aria-hidden="true" />,
        info: <InfoIcon className="size-4 text-[#b7cc7e]" aria-hidden="true" />,
        warning: <TriangleAlertIcon className="size-4 text-[#dfc47a]" aria-hidden="true" />,
        error: <OctagonXIcon className="size-4 text-[#f4b8bc]" aria-hidden="true" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#b7cc7e]" aria-hidden="true" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!w-[min(24rem,calc(100vw-2rem))] !rounded-xl !border !border-[#242a1e] !bg-[#11140e] !px-4 !py-3 !text-[#f2f0e8] !shadow-[0_12px_36px_-16px_rgba(0,0,0,0.9)]",
          title: "!text-[13px] !font-medium !leading-snug !text-[#f2f0e8]",
          description: "!mt-1 !text-xs !leading-relaxed !text-[#a8ab9e]",
          content: "!gap-1",
          actionButton:
            "!h-8 !rounded-lg !bg-[#8fa654] !px-3 !font-medium !text-[#0b0d08] hover:!bg-[#9eb660]",
          cancelButton:
            "!h-8 !rounded-lg !bg-[#1b2116] !px-3 !text-[#c7cabf] hover:!bg-[#242a1e]",
          closeButton:
            "!border-[#3a4530] !bg-[#11140e] !text-[#a8ab9e] hover:!bg-[#1b2116] hover:!text-[#f2f0e8]",
        },
      }}
      style={
        {
          "--normal-bg": "#11140e",
          "--normal-text": "#f2f0e8",
          "--normal-border": "#242a1e",
          "--normal-bg-hover": "#161b12",
          "--normal-border-hover": "#3a4530",
          "--border-radius": "12px",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
