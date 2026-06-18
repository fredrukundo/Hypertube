"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { useUpdateProfile } from "@/hooks/useUser";
import { useToastStore } from "@/store/toast.store";
import { User } from "@/types/user.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface ProfilePictureUploadProps {
  user: User;
}

export default function ProfilePictureUpload({
  user,
}: ProfilePictureUploadProps) {
  const updateProfile = useUpdateProfile();
  const { success, error } = useToastStore();
  
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useLanguage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      error(t.profile.invalidImage);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error(t.profile.imageTooLarge);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      await updateProfile.mutateAsync({
        profile_picture: file,
      });

      success(t.profile.uploadSuccess);
      setPreview(null);
    } catch (err: any) {
     error(err.message || t.profile.uploadError);
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6">
      <h2 className="text-lg font-black text-foreground mb-4">
        {t.profile.profilePicture}
      </h2>

      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar
            src={preview || user.profile_picture}
            alt={user.username}
            initials={initials}
            size="lg"
            className="!w-24 !h-24 !text-2xl"
          />
          
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload New"}
            </button>

            {preview && !uploading && (
              <button
                onClick={handleRemovePreview}
                className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border-2 border-destructive/30 hover:border-destructive font-bold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF. Max size 5MB. Recommended: 400x400px
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}