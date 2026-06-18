export interface User {
  id: string | number;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  preferred_language?: string;
  auth_provider?: "local" | "github" | "discord" | "42";
}

export interface UserListItem {
  id: number;
  username: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  preferred_language?: string;
  profile_picture?: File;
  auth_provider?: string;
}

export interface UserProfileResponse {
  id: number
  username: string;
  email?: string;
  profile_picture?: string;
  first_name: string;
  last_name: string;
  preferred_language?: string;
  auth_provider?: string;
}

// Error types
export interface UserError {
  error: {
    code:
      | "USER_NOT_FOUND"
      | "FORBIDDEN_OPERATION"
      | "NO_FIELDS_TO_UPDATE"
      | "INVALID_EMAIL"
      | "EMAIL_TOO_LONG"
      | "EMAIL_ALREADY_EXISTS"
      | "INVALID_USERNAME"
      | "USERNAME_ALREADY_EXISTS"
      | "INVALID_FIRST_NAME_LENGTH"
      | "INVALID_LAST_NAME_LENGTH"
      | "UNSUPPORTED_LANGUAGE"
      | "GENERAL_ERROR"
      | string;
  };
}