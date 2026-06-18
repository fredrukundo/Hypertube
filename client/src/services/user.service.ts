import api from "@/lib/axios";
import { 
  User, 
  UserListItem, 
  UpdateUserData, 
  UserProfileResponse,
  UserError 
} from "@/types/user.types";
import { AxiosError } from "axios";



// Error message mapper
function getUserErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    USER_NOT_FOUND: "User not found",
    FORBIDDEN_OPERATION: "You can only update your own profile",
    NO_FIELDS_TO_UPDATE: "No fields provided to update",
    INVALID_EMAIL: "Invalid email format",
    EMAIL_TOO_LONG: "Email is too long",
    EMAIL_ALREADY_EXISTS: "This email is already in use",
    INVALID_USERNAME: "Invalid username format",
    USERNAME_ALREADY_EXISTS: "This username is already taken",
    INVALID_FIRST_NAME_LENGTH: "First name must be between 2-50 characters",
    INVALID_LAST_NAME_LENGTH: "Last name must be between 2-50 characters",
    UNSUPPORTED_LANGUAGE: "Unsupported language",
    GENERAL_ERROR: "An error occurred",
  };

  return errorMessages[code] || "An unexpected error occurred";
}


// Get All Users 
export async function getAllUsers(): Promise<UserListItem[]> {

  try {
    const response = await api.get<{ success: { data: UserListItem[] } }>("/users");
    return response.data.success.data;
  } catch (error) {
    const axiosError = error as AxiosError<UserError>;
    
    if (axiosError.response?.data?.error) {
      throw new Error(getUserErrorMessage(axiosError.response.data.error.code));
    }
    
    throw new Error("Failed to fetch users");
  }
}

// Get User Profile
export async function getUserProfile(
  userId: string | number
): Promise<User | null> {
  try {
    const response = await api.get<UserProfileResponse>(
      `/users/${userId}`
    );

    return {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      first_name: response.data.first_name,
      last_name: response.data.last_name,
      profile_picture: response.data.profile_picture,
      preferred_language: response.data.preferred_language,
    };
  } catch (error) {
    const axiosError = error as AxiosError<UserError>;

    const status = axiosError.response?.status;

    if (status === 404) {
      return null;
    }

    if (axiosError.response?.data?.error) {
      throw new Error(
        getUserErrorMessage(
          axiosError.response.data.error.code
        )
      );
    }

    throw new Error("Failed to fetch user profile");
  }
}
// Update User Profile
export async function updateUserProfile(
  userId: string | number,
  data: UpdateUserData
): Promise<void> {

  try {
        if (data.profile_picture) {
      const formData = new FormData();
      
      if (data.email) formData.append("email", data.email);
      if (data.username) formData.append("username", data.username.toLowerCase());
      if (data.first_name) formData.append("first_name", data.first_name);
      if (data.last_name) formData.append("last_name", data.last_name);
      if (data.preferred_language) formData.append("preferred_language", data.preferred_language);
      
      // Add profile picture file
      formData.append("profile_picture", data.profile_picture);

      const response = await api.patch(`/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
    } else {
      // No file, use JSON
      const payload: Record<string, string> = {};
      if (data.email) payload.email = data.email;
      if (data.username) payload.username = data.username.toLowerCase();
      if (data.first_name) payload.first_name = data.first_name;
      if (data.last_name) payload.last_name = data.last_name;
      if (data.preferred_language) payload.preferred_language = data.preferred_language;

      const response = await api.patch(`/users/${userId}`, payload);
      
    }
  } catch (error) {
    
    const axiosError = error as AxiosError<UserError>;
    
    if (axiosError.response?.data?.error) {
      throw new Error(getUserErrorMessage(axiosError.response.data.error.code));
    }
    
    throw new Error("Failed to update profile");
  }
}

// Get Current User (helper)
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<UserProfileResponse>("/users/me");

  return {
    id: response.data.id,
    username: response.data.username,
    email: response.data.email,
    first_name: response.data.first_name,
    last_name: response.data.last_name,
    profile_picture: response.data.profile_picture,
    preferred_language: response.data.preferred_language,
  };
}