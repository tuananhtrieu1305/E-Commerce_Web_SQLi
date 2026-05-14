#!/bin/sh
# ============================================================
# Docker Entrypoint — Frontend
# Inject VITE_BACKEND_URL vào runtime-env.js trước khi start Nginx
# Cho phép switch backend (vulnerable/secure) mà KHÔNG cần rebuild image
# ============================================================

cat > /usr/share/nginx/html/runtime-env.js << EOF
window.__RUNTIME_CONFIG__ = {
  BACKEND_URL: "${VITE_BACKEND_URL:-http://localhost:8082}"
};
EOF

echo "✅ Runtime config injected: BACKEND_URL=${VITE_BACKEND_URL:-http://localhost:8082}"

# Start Nginx
exec nginx -g "daemon off;"
