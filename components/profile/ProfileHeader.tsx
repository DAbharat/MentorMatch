"use client"
import React, { useState } from 'react'
import { DM_Sans } from 'next/font/google';
import { Button } from '../retroui/Button';
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import RequestFormContainer from '../mentorship-request/RequestFormContainer';
import { MessageCircleMore } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { updateMyProfile } from '@/services/profile.service';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';


const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type Skills = {
  id: string;
  name: string;
}

type ProfileHeaderProps = {
  id: string;
  name: string;
  bio: string;
  createdAt: string;
  clerkUserId: string;
  skillsOffered: Skills[];
  skillsWanted: Skills[];
  hasAcceptedRequest?: boolean;
  chatId?: string;
  hasActiveConfirmedSession?: boolean;
}

function getMemberSince(createdAt: string) {
  return new Date(createdAt).getFullYear();
}

export default function ProfileHeader(
  { id, name, bio, createdAt, clerkUserId, skillsOffered, skillsWanted, hasAcceptedRequest = false, chatId, hasActiveConfirmedSession = false }: ProfileHeaderProps
) {
  const memberSince = getMemberSince(createdAt);
  const router = useRouter()
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: name || "",
    bio: bio || "",
    skillsOffered: skillsOffered?.map(s => s.name).join(", ") || "",
    skillsWanted: skillsWanted?.map(s => s.name).join(", ") || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "An error occurred while updating profile."
      );
    }
  };

  if (!user) {
    return null;
  }

  const isOwner = user.id === clerkUserId

  return (
    <div className={`bg-linear-to-br ${DM_Sans_Font.className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <header className="pt-16 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* LEFT: Avatar */}
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white text-xl font-semibold shadow-md">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* RIGHT: Info + Button */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-semibold">{name}</h1>

              <p className="text-muted-foreground mt-1">{bio}</p>

              <p className="text-muted-foreground text-sm mt-1">
                Member since {memberSince}
              </p>

              {/* Button exactly below "Member since" */}
              {isOwner ? (
                <Button
                  size="sm"
                  className="mt-6 bg-transparent border border-black border-b-2 text-black px-4"
                  onClick={() => setIsEditSheetOpen(true)}
                >
                  Edit Profile
                </Button>
              ) : hasAcceptedRequest && chatId ? (
                <div className="flex gap-2 mt-6">
                  <Button
                    size="sm"
                    className="bg-transparent border border-black border-b-2 text-black px-4 flex items-center gap-2"
                    onClick={() => router.push(`/chats/${chatId}`)}
                  >
                    <MessageCircleMore className="w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    className="bg-transparent border border-black border-b-2 text-black px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setOpen(true)}
                    disabled={hasActiveConfirmedSession}
                    title={hasActiveConfirmedSession ? "You have an active confirmed session. Wait until it completes to send another request." : "Send a new mentorship request"}
                  >
                    Send Request
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="mt-6 bg-transparent border border-black border-b-2 text-black px-4"
                  onClick={() => setOpen(true)}
                >
                  Send Request
                </Button>
              )}
            </div>
            {open && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
              <SheetContent className={`${DM_Sans_Font.className} flex flex-col p-0 sm:max-w-lg w-full`}>

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b bg-muted/40">
                  <SheetTitle className="text-xl font-semibold">
                    Edit Profile
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground mt-1">
                    Update your personal information and skills.
                  </SheetDescription>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="h-11"
                        required
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="font-medium">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell others about yourself..."
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Keep it short and meaningful.
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t pt-6 space-y-6">

                      {/* Skills Offered */}
                      <div className="space-y-2">
                        <Label htmlFor="skillsOffered" className="font-medium">
                          Skills You Can Offer
                        </Label>
                        <Input
                          id="skillsOffered"
                          name="skillsOffered"
                          value={formData.skillsOffered}
                          onChange={handleInputChange}
                          placeholder="React, Node.js, PostgreSQL"
                          className="h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Separate skills with commas
                        </p>
                      </div>

                      {/* Skills Wanted */}
                      <div className="space-y-2">
                        <Label htmlFor="skillsWanted" className="font-medium">
                          Skills You Want to Learn
                        </Label>
                        <Input
                          id="skillsWanted"
                          name="skillsWanted"
                          value={formData.skillsWanted}
                          onChange={handleInputChange}
                          placeholder="Machine Learning, Cloud"
                          className="h-11"
                        />
                      </div>

                    </div>

                  </form>
                </div>

                {/* Sticky Footer Buttons */}
                <div className="border-t bg-white p-6 flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsEditSheetOpen(false)}
                    className="flex-1 h-11 bg-transparent border border-black text-black hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="flex-1 h-11 bg-black hover:bg-gray-800 text-white rounded-lg"
                  >
                    Save Changes
                  </Button>
                </div>

              </SheetContent>
            </Sheet>

            <UserButton />

          </div>
        </header>
      </div>
    </div>
  );
}