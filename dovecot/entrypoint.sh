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

envsubst < /etc/dovecot/dovecot-sql.conf.ext.template > /etc/dovecot/dovecot-sql.conf.ext
chmod 644 /etc/dovecot/dovecot-sql.conf.ext

# Generate master user file for ffapi
# Master user password from DOVECOT_MASTER_PASSWORD env
MASTER_PW="${DOVECOT_MASTER_PASSWORD:-FlutterFlirtMasterSecret123!}"
MASTER_HASH=$(doveadm pw -s BLF-CRYPT -p "$MASTER_PW")
echo "ffapi:$MASTER_HASH" > /etc/dovecot/master-users
chmod 644 /etc/dovecot/master-users

# Ensure mail storage directory permissions
mkdir -p /var/mail/vhosts
chown -R vmail:vmail /var/mail/vhosts
chmod -R 770 /var/mail/vhosts

echo "Starting Dovecot IMAP and LMTP server..."
exec /usr/sbin/dovecot -F

