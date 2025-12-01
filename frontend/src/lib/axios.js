import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "https://linkedin-clone-backend-alpha.vercel.app"
      : "/api/v1",
  withCredentials: true,
});
