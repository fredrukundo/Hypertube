"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, Star } from "lucide-react";
import { Comment } from "@/types/comment.types";
import { useAuthStore } from "@/store/auth.store";
import { useUpdateComment, useDeleteComment } from "@/hooks/useComments";
import { useToastStore } from "@/store/toast.store";
import Avatar from "@/components/common/Avatar";
import { sanitizeText } from "@/lib/sanitize";
import { useConfirmStore } from "@/store/confirm.store";

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const { user } = useAuthStore();
  const { success, error } = useToastStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const confirm = useConfirmStore((state) => state.confirm);

  // Check if current user owns this comment
  const isOwner = user?.id && String(comment.user_id) === String(user.id);

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      error("Comment cannot be empty");
      return;
    }

    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        data: { comment: editContent.trim() },
      });

      success("Comment updated!");
      setIsEditing(false);
    } catch (err: any) {
      error(err.message || "Failed to update comment");
    }
  };

  const handleDelete = async () => {
    
    const confirmed = await confirm("Delete this coomment?");

    if (!confirmed) return;

    try {
      await deleteComment.mutateAsync({
        commentId: comment.id,
        movieId: comment.movie_id,
      });
      success("Comment deleted!");
    } catch (err: any) {
      error(err.message || "Failed to delete comment");
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Avatar initials from username
  const initials = comment.username.slice(0, 2).toUpperCase();

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <Avatar
            src={undefined}
            alt={comment.username}
            initials={initials}
            size="sm"
          />

          <div>
            <p className="text-sm font-bold text-foreground">
              @{comment.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </p>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-[#2872A1] hover:bg-secondary transition-all"
              aria-label="Edit comment"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteComment.isPending}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
              aria-label="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-[#2872A1] bg-background text-foreground text-sm resize-none outline-none focus:ring-2 focus:ring-[#2872A1]/20"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={updateComment.isPending || !editContent.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[#2872A1] text-white hover:bg-[#1A4A6B] disabled:opacity-50 transition-all"
            >
              {updateComment.isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Save
            </button>
          </div>
        </div>
      ) : (

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= comment.rate
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}

              <span className="ml-1 text-xs text-muted-foreground">
                {comment.rate}/5
              </span>
            </div>

            <p className="text-sm text-foreground leading-relaxed">
              {sanitizeText(comment.content)}
            </p>
        </div>

      )

        
      }
    </div>
  );
}