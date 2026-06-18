"use client";

import { useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";
import { useMovieComments, useCreateComment } from "@/hooks/useComments";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";
import CommentCard from "./CommentCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface CommentSectionProps {
  movieId: string | number;
}

export default function CommentSection({ movieId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const { success, error } = useToastStore();

  const [commentText, setCommentText] = useState("");
  const [rate, setRate] = useState(2);


  const { data: comments = [], isLoading, refetch } = useMovieComments(movieId);
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      error("Comment cannot be empty");
      return;
    }

    if (commentText.length > 500) {
      error("Comment is too long (max 500 characters)");
      return;
    }

    try {
      await createComment.mutateAsync({
        comment: commentText.trim(),
        movie_id: movieId,
        rate,
      });

      success("Comment posted!");
      setCommentText("");
      refetch();
    } catch (err: any) {
      error(err.message || "Failed to post comment");
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare size={20} className="text-[#2872A1]" />
        <h2 className="text-2xl font-black text-foreground">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts about this movie..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRate(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={
                      star <= rate
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    }
                  />
                </button>
              ))}

              {/* Unstar = 0 */}
              <button
                type="button"
                onClick={() => setRate(0)}
                className="ml-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>

              <span className="ml-2 text-sm text-muted-foreground">
                {rate}/5
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {commentText.length} / 500 characters
            </p>

            <button
              type="submit"
              disabled={!commentText.trim() || createComment.isPending}
              className="flex items-center gap-2 bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createComment.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Please{" "}
            <a href="/login" className="text-[#2872A1] font-semibold hover:underline">
              log in
            </a>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">💬</span>
            <p className="text-muted-foreground text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}