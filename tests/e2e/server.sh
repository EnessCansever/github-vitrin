#!/usr/bin/env bash
set -eu
work=$(mktemp -d)
container=""
mongo=""
app=""
cleanup() {
  if [ -n "$app" ]; then kill "$app" 2>/dev/null || true; fi
  if [ -n "$mongo" ]; then kill "$mongo" 2>/dev/null || true; wait "$mongo" || true; fi
  if [ -n "$container" ]; then docker stop "$container" >/dev/null; fi
  rm -rf "$work"
}
trap cleanup EXIT
trap 'exit 0' TERM INT
if command -v mongod >/dev/null; then
  mongod --dbpath "$work" --bind_ip 127.0.0.1 --port 37917 --replSet rv-e2e >"$work/mongo.log" 2>&1 &
  mongo=$!
  until grep -q 'Waiting for connections' "$work/mongo.log"; do kill -0 "$mongo"; sleep 0.2; done
else
  container=$(docker run --detach --rm -p 127.0.0.1:37917:37917 mongo:8.0 --port 37917 --replSet rv-e2e --bind_ip_all)
fi
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj '/CN=localhost' -keyout "$work/key" -out "$work/cert" 2>/dev/null
NODE_ENV=production node tests/e2e/server.mjs "$work" &
app=$!
wait "$app"
