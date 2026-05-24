#!/bin/sh
set -e

# Ensure blacklist file exists
if [ ! -f /etc/nginx/blacklist.conf ]; then
  echo "# runtime blacklist" > /etc/nginx/blacklist.conf
fi

# Start admin API in background
python3 /opt/proxy/admin.py &
ADMIN_PID=$!

# Start nginx in foreground
nginx -g "daemon off;"

# When nginx exits, stop admin
kill "$ADMIN_PID" || true
