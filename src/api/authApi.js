
import api from "./axiosInstance";

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/register", userData); // <-- just endpoint
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network Error" };
  }
};

// Login user
export const loginUser = async ({ email, password,isAdmin = false }) => {
  try {
    const params = new URLSearchParams();
    params.append("username", email); // must be "username" for OAuth2
    params.append("password", password);
    const endpoint = isAdmin ? "/admin/login" : "/login";
    const response = await api.post(endpoint, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

     return {
      role: response.data.role,
    };
  } catch (err) {
    return {
      error: err.response?.data?.detail || "Login failed",
    };
  }
};

// Get user profile
export const getUserProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/logout");
  return response.data;
};
