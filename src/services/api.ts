import axios from "axios";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
  };
}

/**
 * Axios instance configured for GeoTrack REST API.
 * Communicates with backend Golang API at VITE_API_BASE_URL (default: http://localhost:8080/api/v1).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Response Interceptor: Automatically unwrap standard backend envelope
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "data" in response.data
    ) {
      const envelope = response.data as ApiEnvelope<unknown>;
      response.data = envelope.data;
      (response as any).meta = envelope.meta;
    }
    return response;
  },
  (error) => {
    const errorData = error?.response?.data?.error;
    const msg = errorData?.message || error?.message || "An unexpected network error occurred";
    console.error("[GeoTrack API Error]:", errorData || error.message);
    return Promise.reject(new Error(msg));
  },
);
