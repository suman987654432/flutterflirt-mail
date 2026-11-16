#!/bin/bash
set -e

# Ensure SSL certificate exists (generate self-signed fallback if missing)
if [ ! -f /etc/ssl/certs/fullchain.pem ] || [ ! -f /etc/ssl/certs/privkey.pem ]; then
    echo "Generating fallback self-signed SSL certificates for development..."
    mkdir -p /etc/ssl/certs
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/certs/privkey.pem \
        -out /etc/ssl/certs/fullchain.pem \
        -subj "/C=IN/ST=Delhi/L=Delhi/O=FlutterFlirt/CN=mail.flutterflirt.com"
fi
chmod 600 /etc/ssl/certs/privkey.pem || true

# Substitute environment variables into Postfix pgsql cf files only
for f in /etc/postfix/pgsql-*.cf; do
    envsubst '${DB_USER} ${DB_PASSWORD} ${DB_NAME} ${DB_HOST}' < "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done

cp /etc/postfix/main.cf.template /etc/postfix/main.cf

# Ensure proper permissions
chown -R root:root /etc/postfix
chmod 644 /etc/postfix/pgsql-*.cf
chmod 644 /etc/postfix/master.cf
chmod 644 /etc/postfix/main.cf

echo "Starting Postfix mail transfer agent..."
exec postfix start-fg
