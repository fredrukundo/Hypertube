export interface Comment {
  id: number;
  rate: number;
  content: string;
  created_at: string;
  username: string;
  user_id: number;
  movie_id: number;
}

export interface CreateCommentData {
  comment: string;
  movie_id: number | string;
  rate: number;
}

export interface UpdateCommentData {
  comment: string;
}

export interface CommentError {
  error: {
    code:
      | "COMMENT_NOT_FOUND"
      | "MISSING_COMMENT_OR_MOVIE_ID"
      | "COMMENT_IS_REQUIRE"
      | "NOT_ALLOWED_OR_NOT_FOUND"
      | "GENERAL_ERROR"
      | string;
  };
}

export interface CommentResponse {
  success: {
    data: Comment;
  };
}

export interface CommentsListResponse {
  success: {
    data: Comment[];
  };
}