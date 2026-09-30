#!/usr/bin/env bash
set -euo pipefail

echo "Avvio ambiente di sviluppo PISSIR"

# Avvia docker compose (Postgres, Mosquitto, Java backend)
if command -v docker >/dev/null 2>&1; then
  echo "Avvio docker compose..."
  docker compose up -d --build
else
  echo "Docker non trovato: salta avvio docker. Assicurati di avere Postgres e Mosquitto attivi." >&2
fi

# Avvia il server Node
echo "Avvio Node server (config/server.js)..."
node config/server.js &
NODE_PID=$!

echo "Server Node avviato con PID $NODE_PID"
echo "Attendi che il backend Java sia online su http://localhost:8080 (puoi controllare i log Docker)."

echo "Per terminare: kill $NODE_PID e docker compose down"
