"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLatestComments,
  getMovieComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
} from "@/services/comment.service";
import { CreateCommentData, UpdateCommentData } from "@/types/comment.types";

//  Get Latest Comments
export function useLatestComments() {
  return useQuery({
    queryKey: ["comments", "latest"],
    queryFn: getLatestComments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get Movie Comments
export function useMovieComments(movieId: string | number) {
  return useQuery({
    queryKey: ["comments", "movie", movieId],
    queryFn: () => getMovieComments(movieId),
    enabled: !!movieId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get Single Comment
export function useComment(commentId: number) {
  return useQuery({
    queryKey: ["comments", commentId],
    queryFn: () => getComment(commentId),
    enabled: !!commentId,
  });
}

// Create Comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (newComment) => {
      // Invalidate movie comments
      if (newComment.movie_id) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "movie", newComment.movie_id],
        });
      }

      // Invalidate latest comments
      queryClient.invalidateQueries({
        queryKey: ["comments", "latest"],
      });
    },
  });
}

// Update Comment
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: number;
      data: UpdateCommentData;
    }) => updateComment(commentId, data),
    onSuccess: (updatedComment) => {
      // Invalidate specific comment
      queryClient.invalidateQueries({
        queryKey: ["comments", updatedComment.id],
      });

      // Invalidate movie comments
      if (updatedComment.movie_id) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "movie", updatedComment.movie_id],
        });
      }

      // Invalidate latest comments
      queryClient.invalidateQueries({
        queryKey: ["comments", "latest"],
      });
    },
  });
}

// Delete Comment
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      movieId,
    }: {
      commentId: number;
      movieId: number;
    }) => deleteComment(commentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "movie", variables.movieId],
      });

      queryClient.invalidateQueries({
        queryKey: ["comments", "latest"],
      });
    },
  });
}