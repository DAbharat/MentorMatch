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
      richColors
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#6ee7b7]" aria-hidden="true" />,
        info: <InfoIcon className="size-4 text-[#b7cc7e]" aria-hidden="true" />,
        warning: <TriangleAlertIcon className="size-4 text-[#dfc47a]" aria-hidden="true" />,
        error: <OctagonXIcon className="size-4 text-[#f4b8bc]" aria-hidden="true" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#b7cc7e]" aria-hidden="true" />,
      }}
      style={
        {
          "--normal-bg": "#11140e",
          "--normal-text": "#f2f0e8",
          "--normal-border": "#242a1e",
          "--success-bg": "#14231f",
          "--success-text": "#d1fae5",
          "--success-border": "#265944",
          "--info-bg": "#161b12",
          "--info-text": "#f2f0e8",
          "--info-border": "#3a4530",
          "--warning-bg": "#2b2517",
          "--warning-text": "#f6e5ad",
          "--warning-border": "#6b5528",
          "--error-bg": "#231214",
          "--error-text": "#f4b8bc",
          "--error-border": "#61282d",
          "--border-radius": "12px",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
