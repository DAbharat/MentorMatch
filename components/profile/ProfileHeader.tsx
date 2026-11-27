"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircleMore, Pencil, Send } from "lucide-react";
import { DM_Sans } from "next/font/google";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import RequestFormContainer from "../mentorship-request/RequestFormContainer";
import { updateMyProfile } from "@/services/profile.service";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useAuth } from "@/hooks/useAuth";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Skills = {
  id: string;
  name: string;
};

type ProfileHeaderProps = {
  id: string;
  name: string;
  bio: string;
  createdAt: string;
  skillsOffered: Skills[];
  skillsWanted: Skills[];
  hasAcceptedRequest?: boolean;
  chatId?: string;
  hasActiveConfirmedSession?: boolean;
  onProfileUpdated?: () => void | Promise<void>;
};

function getMemberSince(createdAt: string) {
  const year = new Date(createdAt).getFullYear();
  return Number.isNaN(year) ? "Recently" : String(year);
}

const fieldClassName =
  "auth-input bg-[#0d0f0b] border-[#283022] text-[#f2f0e8] placeholder:text-[#787d6f] caret-[#9eb660] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/25 transition-colors rounded-xl text-sm";

export default function ProfileHeader({
  id,
  name,
  bio,
  createdAt,
  skillsOffered,
  skillsWanted,
  hasAcceptedRequest = false,
  chatId,
  hasActiveConfirmedSession = false,
  onProfileUpdated,
}: ProfileHeaderProps) {
  const memberSince = getMemberSince(createdAt);
  const router = useRouter();
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: name || "",
    bio: bio || "",
    skillsOffered: skillsOffered?.map((s) => s.name).join(", ") || "",
    skillsWanted: skillsWanted?.map((s) => s.name).join(", ") || "",
  });

  const openEditSheet = () => {
    setFormData({
      name: name || "",
      bio: bio || "",
      skillsOffered: skillsOffered?.map((s) => s.name).join(", ") || "",
      skillsWanted: skillsWanted?.map((s) => s.name).join(", ") || "",
    });
    setIsEditSheetOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMyProfile({
        name: formData.name,
        bio: formData.bio,
        skillsOffered: formData.skillsOffered
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        skillsWanted: formData.skillsWanted
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      toast.success("Profile updated successfully!");
      setIsEditSheetOpen(false);
      await onProfileUpdated?.();
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "An error occurred while updating profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isOwner = userId === id;
  const initial = (name?.trim().charAt(0) || "M").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 ${DM_Sans_Font.className}`}
    >
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 min-w-0">
          {/* Avatar */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-full bg-[#161b12] border border-[#3a4530] flex items-center justify-center text-[#b7cc7e] text-2xl font-semibold">
            {initial}
          </div>

          {/* Identity & bio */}
          <div className="text-center sm:text-left min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f2f0e8] break-words">
              {name}
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-[#8a8f80]">
              Member since {memberSince}
            </p>

            {(bio || isOwner) && (
              <p
                className={`mt-3 text-sm sm:text-base leading-relaxed max-w-xl ${
                  bio ? "text-[#c7cabf]" : "text-[#787d6f]"
                }`}
              >
                {bio ||
                  "No bio added yet. Share what you build and what you want to learn."}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0 sm:pt-1">
          {isOwner ? (
            userId && (
              <Button
                type="button"
                onClick={openEditSheet}
                className="h-11 px-4 rounded-xl bg-[#11140e] border border-[#283022] text-[#f2f0e8] hover:bg-[#161b12] hover:border-[#3c4832] font-medium text-sm transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-[#b7cc7e]" aria-hidden="true" />
                Edit profile
              </Button>
            )
          ) : userId && hasAcceptedRequest && chatId ? (
            <>
              <Button
                type="button"
                onClick={() => router.push(`/chats/${chatId}`)}
                className="h-11 px-4 rounded-xl bg-[#11140e] border border-[#283022] text-[#f2f0e8] hover:bg-[#161b12] hover:border-[#3c4832] font-medium text-sm transition-colors cursor-pointer"
              >
                <MessageCircleMore
                  className="w-4 h-4 text-[#b7cc7e]"
                  aria-hidden="true"
                />
                Message
              </Button>
              <Button
                type="button"
                onClick={() =>
                  userId ? setOpen(true) : router.push("/sign-in")
                }
                disabled={hasActiveConfirmedSession}
                title={
                  hasActiveConfirmedSession
                    ? "You have an active confirmed session. Wait until it completes to send another request."
                    : "Send a new mentorship request"
                }
                className="h-11 px-4 rounded-xl bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                Send request
              </Button>
            </>
          ) : (
            !isOwner && (
              <Button
                type="button"
                onClick={() =>
                  userId ? setOpen(true) : router.push("/sign-in")
                }
                className="h-11 px-4 rounded-xl bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold text-sm transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                Send request
              </Button>
            )
          )}
        </div>
      </header>

      {/* Send Request Modal */}
      {userId && open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Send mentorship request to ${name}`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#11140e] border border-[#242a1e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]"
          >
            <RequestFormContainer
              mentorId={id}
              mentorName={name}
              skills={skillsOffered}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Sheet */}
      {userId && isOwner && (
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent
            className={`${DM_Sans_Font.className} bg-[#11140e] border-l border-[#242a1e] text-[#f2f0e8] flex flex-col p-0 sm:max-w-lg w-full`}
          >
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#1e2419] bg-[#11140e] text-left">
              <SheetTitle className="text-[#f2f0e8] text-xl font-semibold">
                Edit profile
              </SheetTitle>
              <SheetDescription className="text-sm text-[#a8ab9e] mt-1">
                Update your personal details and the skills you offer or want to learn.
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-[#c7cabf]"
                  >
                    Full name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className={`${fieldClassName} h-11`}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="bio"
                    className="text-xs font-medium text-[#c7cabf]"
                  >
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="What you build, mentor, or want to learn..."
                    rows={4}
                    className={`${fieldClassName} resize-none py-2.5`}
                    disabled={isSaving}
                  />
                </div>

                <div className="border-t border-[#1e2419] pt-5 space-y-5">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="skillsOffered"
                      className="text-xs font-medium text-[#c7cabf]"
                    >
                      Skills you can offer
                    </Label>
                    <Input
                      id="skillsOffered"
                      name="skillsOffered"
                      value={formData.skillsOffered}
                      onChange={handleInputChange}
                      placeholder="React, Node.js, PostgreSQL"
                      className={`${fieldClassName} h-11`}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-[#787d6f]">
                      Separate skills with commas.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="skillsWanted"
                      className="text-xs font-medium text-[#c7cabf]"
                    >
                      Skills you want to learn
                    </Label>
                    <Input
                      id="skillsWanted"
                      name="skillsWanted"
                      value={formData.skillsWanted}
                      onChange={handleInputChange}
                      placeholder="System Design, Go, AWS"
                      className={`${fieldClassName} h-11`}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-[#787d6f]">
                      Separate skills with commas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1e2419] bg-[#11140e] p-6 flex gap-3">
                <Button
                  type="button"
                  onClick={() => setIsEditSheetOpen(false)}
                  disabled={isSaving}
                  className="flex-1 h-11 bg-[#0d0f0b] border border-[#283022] text-[#c7cabf] hover:bg-[#161b12] hover:text-[#f2f0e8] hover:border-[#3c4832] rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-11 bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
