import axios, { AxiosError } from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (
      error.status === 401 &&
      localStorage.getItem("refreshToken") &&
      error.config &&
      ![`/users/login`, `/users/register`, `/users/refresh-tokens`].includes(
        error?.config?.url ?? ""
      )
    ) {
      const response = await fetch(API_URL + "/users/refresh-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        if (error.config && error.config.headers) {
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return client.request(error.config);
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    throw error?.response?.data;
  }
);

export { client };
