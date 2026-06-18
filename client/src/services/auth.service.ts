import api from "@/lib/axios";
import {  
  RegisterCredentials, 
  AuthResponse, 
  RegisterResponse,
  AuthError 
} from "@/types/auth.types";
import { AxiosError } from "axios";
import { getCurrentUser } from "./user.service";
import { useAuthStore } from "@/store/auth.store";

const TOKEN_KEY = "hypertube_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = [
      `${TOKEN_KEY}=${token}`,
      `path=/`,
      `max-age=${COOKIE_MAX_AGE}`,
      `SameSite=Lax`,
    ].join("; ");
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}


// Error message mapper
function getErrorMessage(
  code: string,
  fields?: Record<string, string[]>
): string {
  const validationFields = fields
    ? Object.values(fields)
        .flat()
        .filter(Boolean)
        .join(", ")
    : "";

  const errorMessages: Record<string, string> = {
    MISSING_FIELDS: `Missing required fields: ${validationFields}`,
    VALIDATION_ERROR: validationFields || "Validation failed",
    INVALID_CREDENTIALS: "Incorrect email/username or password",
    INVALID_EMAIL: "Invalid email format",
    EMAIL_ALREADY_EXISTS: "This email is already registered",
    USERNAME_ALREADY_EXISTS: "This username is already taken",
    INVALID_USERNAME:
      "Username must be lowercase, 3+ chars, can contain dots (but not at start/end or consecutive)",
    PASSWORD_NOT_MATCH: "Passwords do not match",
    WEAK_PASSWORD: "Password must be at least 6 characters",
    GENERAL_ERROR: "An error occurred. Please try again",
    RESET_LIMIT_REACHED:
      "Too many reset requests. Please try again later.",
    MISSING_EMAIL: "Email or username is required",
    EXPIRED_SESSION:
      "Reset link has expired. Please request a new one.",
    INVALID_USER: "User not found",
  };

  return errorMessages[code] || "An unexpected error occurred";
}

// Login
export async function login(usernameOrEmail: string, password: string): Promise<AuthResponse> {

  try {

    const response = await api.post<AuthResponse>("/oauth/token", {
      client: usernameOrEmail,
      secret: password,
    });
    
    const token = response.data.token
    
    saveToken(token);

    const user = await getCurrentUser();

    useAuthStore.getState().login(user, token);
    return response.data;
  } catch (error) {
    
    const axiosError = error as AxiosError<AuthError>;
    
    if (axiosError.response?.data?.error) {
      const errorData = axiosError.response.data.error;
      throw new Error(getErrorMessage(errorData.code, errorData.fields));
    }
    
    if (axiosError.response?.data) {
      throw new Error(JSON.stringify(axiosError.response.data));
    }
    
    throw new Error("An unexpected error occurred");
  }
}

// Register
export async function register(credentials: RegisterCredentials): Promise<void> {

  try {
    const payload = {
      username: credentials.username.toLowerCase(),
      email: credentials.email.toLowerCase(),
      first_name: credentials.first_name,
      last_name: credentials.last_name,
      password: credentials.password,
      repassword: credentials.repassword,
    };


    const response = await api.post<RegisterResponse>("/users/register", payload);
    
  } catch (error) {
    
    const axiosError = error as AxiosError<AuthError>;
    
    if (axiosError.response?.data?.error) {
      const errorData = axiosError.response.data.error;
      throw new Error(getErrorMessage(errorData.code, errorData.fields));
    }
    
    if (axiosError.response?.data) {
      throw new Error(JSON.stringify(axiosError.response.data));
    }
    
    throw new Error("An unexpected error occurred");
  }
}

// Request Password Reset (Step 1)
export async function requestPasswordReset(emailOrUsername: string): Promise<{ message: string }> {


  try {

    const response = await api.post<{ message: string }>(
      "/security/reset-password/request",
      { email_username: emailOrUsername }
    );


    return response.data;
  
  } catch (error) {

    const axiosError = error as AxiosError<AuthError>;

    if (axiosError.response?.data?.error) {
      const code = axiosError.response.data.error.code;
      throw new Error(getErrorMessage(code));
    }

    throw new Error("Failed to request password reset");
  }
}

export async function confirmResetToken(token: string): Promise<{ message: string }> {

  try {

    const response = await api.get<{ message: string }>(
      `/security/reset-password/confirm?token=${encodeURIComponent(token)}`
    );


    return response.data;
  } catch (error) {

    const axiosError = error as AxiosError<AuthError>;

    if (axiosError.response?.data?.error) {
      const code = axiosError.response.data.error.code;
      throw new Error(getErrorMessage(code));
    }

    throw new Error("Failed to verify reset token");
  }
}

//  Change Password with Token (Step 3) 
export async function changePasswordWithToken(
  token: string,
  newPassword: string,
  rePassword: string
): Promise<{ message: string }> {

  try {

    const response = await api.post<{ message: string }>(
      "/security/reset-password/change",
      {
        token,
        new_password: newPassword,
        re_password: rePassword,
      }
    );


    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;

    if (axiosError.response?.data?.error) {
      const code = axiosError.response.data.error.code;
      throw new Error(getErrorMessage(code));
    }

    throw new Error("Failed to reset password");
  }
}

//  Backward Compatibility Aliases  
export const forgotPassword = requestPasswordReset;
export const resetPassword = (token: string, password: string) =>
  changePasswordWithToken(token, password, password);

//  Logout 
export function logout(): void {
  removeToken();

  delete api.defaults.headers.common["Authorization"];
  
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}