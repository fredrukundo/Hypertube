import api from "@/lib/axios";
import {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  CommentError,
  CommentResponse,
  CommentsListResponse,
} from "@/types/comment.types";
import { AxiosError } from "axios";

// Error message mapper
function getCommentErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    COMMENT_NOT_FOUND: "Comment not found",
    MISSING_COMMENT_OR_MOVIE_ID: "Comment text and movie ID are required",
    COMMENT_IS_REQUIRE: "Comment text is required",
    NOT_ALLOWED_OR_NOT_FOUND: "You can only edit/delete your own comments",
    GENERAL_ERROR: "An error occurred",
  };

  return errorMessages[code] || "An unexpected error occurred";
}



// Get Latest Comment
export async function getLatestComments(): Promise<Comment[]> {

  try {

    const response = await api.get<CommentsListResponse>("/comments");


    return response.data.success.data;
  } catch (error) {
    const axiosError = error as AxiosError<CommentError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getCommentErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Failed to fetch comments");
  }
}

// Get Movie Comments
export async function getMovieComments(
  movieId: string | number
): Promise<Comment[]> {


  try {

    const response = await api.get(`/comments/movies/${movieId}`);

    return response.data.comments;
  } catch (error) {
    const axiosError = error as AxiosError<CommentError>;

    if (axiosError.response?.data?.error) {
      throw new Error(
        getCommentErrorMessage(axiosError.response.data.error.code)
      );
    }

    throw new Error("Failed to fetch comments");
  }
}

// Get Comment by ID 
export async function getComment(commentId: number): Promise<Comment> {

  try {
    const response = await api.get<CommentResponse>(`/comments/${commentId}`);

    return response.data.success.data;
  } catch (error) {
    const axiosError = error as AxiosError<CommentError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getCommentErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Failed to fetch comment");
  }
}

// Create Comment
export async function createComment(data: CreateCommentData): Promise<Comment> {


  try {

    const payload = {
      comment: data.comment,
      movie_id: typeof data.movie_id === 'string' 
        ? parseInt(data.movie_id, 10) 
        : data.movie_id,
        rate: data.rate
    };

    const response = await api.post<CommentResponse>("/comments", payload);

    return response.data.success.data;
  } catch (error) {

    const axiosError = error as AxiosError<CommentError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getCommentErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Failed to create comment");
  }
}

// Update Comment
export async function updateComment(
  commentId: number,
  data: UpdateCommentData
): Promise<Comment> {


  try {
    const response = await api.patch<CommentResponse>(`/comments/${commentId}`, {
      comment: data.comment,
    });


    return response.data.success.data;
  } catch (error) {

    const axiosError = error as AxiosError<CommentError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getCommentErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Failed to update comment");
  }
}

//  Delete Comment
export async function deleteComment(commentId: number): Promise<void> {


  try {

    await api.delete(`/comments/${commentId}`);

  } catch (error) {

    const axiosError = error as AxiosError<CommentError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getCommentErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Failed to delete comment");
  }
}