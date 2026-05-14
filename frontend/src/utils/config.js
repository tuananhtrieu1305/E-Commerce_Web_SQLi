// ============================================================
// Runtime Config — cho phép switch backend URL không cần rebuild
// ============================================================
// Ưu tiên: window.__RUNTIME_CONFIG__ (Docker) > import.meta.env (dev local)
// ============================================================

export const BACKEND_URL =
  (typeof window !== "undefined" && window.__RUNTIME_CONFIG__?.BACKEND_URL) ||
  import.meta.env.VITE_BACKEND_URL ||
  "";
