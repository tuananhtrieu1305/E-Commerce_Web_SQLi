FROM owasp/modsecurity-crs:nginx-alpine

USER root

# Cài đặt Python cho admin.py
RUN apk add --no-cache python3 py3-pip curl

# Tạo môi trường ảo cho Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir flask redis

# Copy cấu hình Proxy
RUN mkdir -p /opt/proxy
COPY nginx.conf /opt/proxy/nginx.conf
RUN echo '#!/bin/sh' > /docker-entrypoint.d/98-apply-app-nginx-conf.sh && \
    echo 'cp /opt/proxy/nginx.conf /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.d/98-apply-app-nginx-conf.sh && \
    chmod +x /docker-entrypoint.d/98-apply-app-nginx-conf.sh
# Đảm bảo blocked_ips.conf tồn tại trước khi Nginx include
RUN touch /etc/nginx/blocked_ips.conf
COPY blocked_ips.conf /etc/nginx/blocked_ips.conf

# Copy ModSecurity configs and custom rules into image
COPY modsecurity /etc/modsecurity
RUN chmod -R 644 /etc/modsecurity || true
RUN mkdir -p /etc/modsecurity/rules || true

# Bật ModSecurity (Env Vars cho OWASP CRS)
ENV MODSEC_RULE_ENGINE=On
ENV MODSEC_REQ_BODY_ACCESS=On
ENV MODSEC_RESP_BODY_ACCESS=On

# Copy admin API
COPY admin.py /opt/proxy/admin.py

# Script khởi động admin.py tự động chạy cùng Nginx
RUN echo '#!/bin/sh' > /docker-entrypoint.d/99-start-admin-api.sh && \
    echo '/opt/venv/bin/python /opt/proxy/admin.py &' >> /docker-entrypoint.d/99-start-admin-api.sh && \
    chmod +x /docker-entrypoint.d/99-start-admin-api.sh

HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD curl -fsS http://localhost/healthz || exit 1

EXPOSE 80 8888
