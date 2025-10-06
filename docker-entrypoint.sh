#!/bin/sh
set -e

mkdir -p /var/log
: > /var/log/cron.log

if [ -f /server/cron/fetch_satellites.cron ]; then
  crontab /server/cron/fetch_satellites.cron
fi

crond -b -L /var/log/cron.log

echo "[Entrypoint] Running initial satellite sync..."
if ! NODE_ENV=${NODE_ENV:-production} /usr/local/bin/node /server/scripts/updateSatellites.js; then
  echo "[Entrypoint] Initial satellite sync failed; continuing with existing data" >&2
fi

echo "[Entrypoint] Starting SOEP server"
exec npm run start
