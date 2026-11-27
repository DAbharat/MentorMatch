"use client";

import { Check, CheckCheck } from "lucide-react";

type SenderCardProps = {
  content: string;
  createdAt: string;
  isRead?: boolean;
  isDelivered?: boolean;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SenderCard({
  content,
  createdAt,
  isRead = false,
  isDelivered = true,
}: SenderCardProps) {
  return (
    <div className="flex w-full justify-end">
      <div className="min-w-0 max-w-[85%] sm:max-w-[75%] md:max-w-2xl">
        <div className="rounded-2xl rounded-br-md bg-[#1b2116] px-4 py-2.5 text-[#f2f0e8]">
          <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </p>
        </div>
        <div className="mt-1 flex items-center justify-end gap-1.5 px-1 text-[11px] tabular-nums text-[#a8ab9e]">
          <time dateTime={createdAt}>{formatTime(createdAt)}</time>
          {isDelivered && (
            <span
              className="inline-flex items-center"
              title={isRead ? "Read" : "Delivered"}
            >
              <span className="sr-only">
                {isRead ? "Read" : "Delivered"}
              </span>
              {isRead ? (
                <CheckCheck
                  className="h-3.5 w-3.5 text-[#b7cc7e]"
                  aria-hidden="true"
                />
              ) : (
                <Check
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}