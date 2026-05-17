FROM python:3.11-alpine

# Install nginx and dependencies
RUN apk add --no-cache nginx libxml2 libxslt pcre zlib libgcc curl

# Create nginx folders
RUN mkdir -p /var/cache/nginx /var/run /etc/nginx/sites-enabled

# Copy configs and app
COPY nginx.conf /etc/nginx/nginx.conf
COPY modsecurity/modsecurity.conf /etc/nginx/modsecurity.conf
COPY modsecurity/crs-setup.conf /etc/nginx/crs-setup.conf
COPY modsecurity/rules/ /etc/nginx/rules/
COPY blocked_ips.conf /etc/nginx/blocked_ips.conf

COPY admin.py /opt/proxy/admin.py
COPY docker-entrypoint.sh /opt/proxy/docker-entrypoint.sh
RUN chmod +x /opt/proxy/docker-entrypoint.sh

# Install Python dependencies
RUN pip install --no-cache-dir flask redis

EXPOSE 80 8080

ENTRYPOINT ["/opt/proxy/docker-entrypoint.sh"]
