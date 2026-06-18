export interface LoginCredentials {
  client: string;   // username or email
  secret: string;   // password
}

export interface RegisterCredentials {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  repassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface RegisterResponse {
  success: {
    code: "REGISTER_SUCCESS";
  };
}

// Error Types
export interface AuthError {
  error: {
    code:
      | "VALIDATION_ERROR"
      | "MISSING_FIELDS"
      | "INVALID_CREDENTIALS"
      | "INVALID_EMAIL"
      | "EMAIL_ALREADY_EXISTS"
      | "USERNAME_ALREADY_EXISTS"
      | "INVALID_USERNAME"
      | "PASSWORD_NOT_MATCH"
      | "WEAK_PASSWORD"
      | "GENERAL_ERROR"
      | "REGISTER_FAILED"
      | "RESET_LIMIT_REACHED"
      | "MISSING_EMAIL"
      | "EXPIRED_SESSION"
      | "INVALID_USER"
      | string;

    fields?: Record<string, string[]>;
  };
}

export type AuthErrorCode = 
  | "MISSING_FIELDS" 
  | "INVALID_CREDENTIALS"
  | "INVALID_EMAIL"
  | "EMAIL_ALREADY_EXISTS"
  | "USERNAME_ALREADY_EXISTS"
  | "INVALID_USERNAME"
  | "PASSWORD_NOT_MATCH"
  | "WEAK_PASSWORD"
  | "GENERAL_ERROR";