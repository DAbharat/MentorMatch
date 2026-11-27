"use client";

type ReceiverCardProps = {
  content: string;
  createdAt: string;
  category?: string;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ReceiverCard({
  content,
  createdAt,
  category,
}: ReceiverCardProps) {
  return (
    <div className="flex w-full justify-start">
      <div className="min-w-0 max-w-[85%] sm:max-w-[75%] md:max-w-2xl">
        {category && (
          <p className="mb-1 px-1 text-[11px] font-medium text-[#8a8f80]">
            {category}
          </p>
        )}
        <div className="rounded-2xl rounded-bl-md bg-[#11140e] px-4 py-2.5 text-[#c7cabf]">
          <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </p>
        </div>
        <div className="mt-1 px-1 text-[11px] tabular-nums text-[#a8ab9e]">
          <time dateTime={createdAt}>{formatTime(createdAt)}</time>
        </div>
      </div>
    </div>
  );
}