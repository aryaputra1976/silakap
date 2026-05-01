import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    const headers = AxiosHeaders.from(config.headers);
    headers.delete("Content-Type");
    headers.delete("content-type");
    config.headers = headers;
  }

  const token = Cookies.get("accessToken");
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetriableRequestConfig | undefined;

    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = Cookies.get("refreshToken");

    if (!refreshToken) {
      Cookies.remove("accessToken");
      return Promise.reject(error);
    }

    original._retry = true;

    if (refreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers = original.headers ?? new AxiosHeaders();
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    refreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefresh } = data.data;

      Cookies.set("accessToken", accessToken, { expires: 1 });
      Cookies.set("refreshToken", newRefresh, { expires: 7 });

      queue.forEach((cb) => cb(accessToken));
      queue = [];

      original.headers = original.headers ?? new AxiosHeaders();
      original.headers.Authorization = `Bearer ${accessToken}`;

      return api(original);
    } catch {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      if (typeof window !== "undefined") {
        window.location.href = "/authentication/sign-in";
      }

      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  },
);
