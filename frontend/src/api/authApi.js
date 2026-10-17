import apiClient from "./apiClient";

/**
 * Register a new user account.
 */
export const signupUser = async ({ username, email, password }) => {
  try {
    const response = await apiClient.post("/api/auth/signup", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error || "Registration failed. Please try again.";
    throw new Error(message);
  }
};

/**
 * Log in an existing user.
 */
export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error || "Invalid email or password.";
    throw new Error(message);
  }
};

/**
 * Retrieve the current authenticated user profile using stored token.
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/api/auth/me");
    return response.data.user;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Session expired or invalid.",
    );
  }
};
