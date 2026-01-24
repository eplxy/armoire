import wretch from "wretch";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = wretch(API_BASE_URL);