"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { Comment } from "@/types/comment.types";
import { useUpdateComment, useDeleteComment } from "@/hooks/useComments";
import { useToastStore } from "@/store/toast.store";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string | number;
}

export default function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const { success, error } = useToastStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  // Check if current user owns this comment
  const isOwner = currentUserId && String(comment.user_id) === String(currentUserId);

  const handleUpdate = async () => {
    if (!editText.trim()) {
      error("Comment cannot be empty");
      return;
    }

    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        data: { comment: editText.trim() },
      });

      success("Comment updated!");
      setIsEditing(false);
    } catch (err: any) {
      error(err.message || "Failed to update comment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

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

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
  });

  return (
    <div className="bg-secondary/30 border-2 border-border rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2872A1] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {comment.username[0].toUpperCase()}
            </span>
          </div>

          <div>
            <p className="text-sm font-bold text-foreground">{comment.username}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Actions (only for owner) */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-[#2872A1] transition-colors p-1"
              aria-label="Edit comment"
            >
              <Edit2 size={14} />
            </button>

            <button
              onClick={handleDelete}
              disabled={deleteComment.isPending}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 disabled:opacity-50"
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
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm resize-none outline-none focus:border-[#2872A1]"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              disabled={updateComment.isPending}
              className="flex items-center gap-1 bg-[#2872A1] hover:bg-[#1A4A6B] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              <Check size={12} />
              Save
            </button>

            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.content);
              }}
              className="flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
      )}
    </div>
  );
}