FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    dovecot-core \
    dovecot-imapd \
    dovecot-lmtpd \
    dovecot-pgsql \
    dovecot-sieve \
    dovecot-managesieved \
    ca-certificates \
    openssl \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Create vmail user and group (uid 5000, gid 5000)
RUN groupadd -g 5000 vmail && \
    useradd -u 5000 -g vmail -s /usr/sbin/nologin -d /var/mail/vhosts -m vmail

COPY dovecot.conf /etc/dovecot/dovecot.conf
COPY dovecot-sql.conf.ext /etc/dovecot/dovecot-sql.conf.ext.template
COPY sieve /etc/dovecot/sieve
RUN sievec /etc/dovecot/sieve/default.sieve

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 143 993 24 12345

CMD ["/entrypoint.sh"]

