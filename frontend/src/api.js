// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // send the httpOnly auth cookie with every request
});

let onUnauthorized = () => {};

export const setOnUnauthorized = (callback) => {
  onUnauthorized = callback;
};

api.interceptors.response.use(
  (response) => response, // if the response is fine, just pass it through unchanged
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error); // still let the original .catch() in components run too
  },
);

export default api;
