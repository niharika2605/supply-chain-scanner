import axios from "axios";

const API_BASE_URL = "https://supply-chain-scanner-backend.onrender.com/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function scanPackageJson(packageJsonContent) {
  try {
    const response = await apiClient.post("/scan", { packageJsonContent });
    return response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data?.error || "Scan failed. Please try again.");
    } else if (err.request) {
      throw new Error(
        "Could not reach the server. Make sure the backend is running on port 5000."
      );
    } else {
      throw new Error("Something went wrong while preparing the request.");
    }
  }
}

export async function getScanHistory() {
  try {
    const response = await apiClient.get("/scan/history");
    return response.data;
  } catch (err) {
    throw new Error("Could not load scan history.");
  }
}

export async function getScanById(scanId) {
  try {
    const response = await apiClient.get(`/scan/${scanId}`);
    return response.data;
  } catch (err) {
    throw new Error("Could not load this scan.");
  }
}

export async function registerUser(email, password) {
  try {
    const response = await apiClient.post("/auth/register", { email, password });
    return response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data?.error || "Registration failed.");
    }
    throw new Error("Could not reach the server. Make sure the backend is running.");
  }
}

export async function loginUser(email, password) {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data?.error || "Login failed.");
    }
    throw new Error("Could not reach the server. Make sure the backend is running.");
  }
}