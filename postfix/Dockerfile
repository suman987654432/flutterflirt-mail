FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    postfix \
    postfix-pgsql \
    sasl2-bin \
    ca-certificates \
    openssl \
    gettext-base \
    rsyslog \
    && rm -rf /var/lib/apt/lists/*

COPY main.cf /etc/postfix/main.cf.template
COPY master.cf /etc/postfix/master.cf
COPY pgsql-*.cf /etc/postfix/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 25 465 587

CMD ["/entrypoint.sh"]

