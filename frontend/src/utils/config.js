// ============================================================
// Runtime Config — cho phép switch backend URL không cần rebuild
// ============================================================
// Ưu tiên: window.__RUNTIME_CONFIG__ (Docker) > import.meta.env (dev local)
//
// BACKEND_URL — base cho API calls (bao gồm proxy prefix)
//   Docker:  http://localhost/api/secure  → proxy strips /api/secure/ → BE /api/...
//   Dev:     http://localhost:8082
//
// STATIC_URL — base cho static files như /uploads/ (chỉ là origin, không có prefix)
//   Docker:  http://localhost  → proxy /uploads/ được serve bởi frontend nginx
//   Dev:     http://localhost:8082
// ============================================================

const runtimeConfig =
  typeof window !== "undefined" ? window.__RUNTIME_CONFIG__ : {};

export const BACKEND_URL =
  runtimeConfig?.BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "";

// STATIC_URL: lấy chỉ origin (bỏ prefix /api/secure hoặc /api/vuln)
// Ví dụ: "http://localhost/api/secure" → "http://localhost"
export const STATIC_URL = (() => {
  const url = runtimeConfig?.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || "";
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
})();
