#!/usr/bin/env bash
set -euo pipefail

echo "Script di setup locale (macOS) per PISSIR - usa Homebrew"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew non trovato. Installa Homebrew seguendo: https://brew.sh/" >&2
  exit 1
fi

echo "Installazione pacchetti: openjdk@17 maven postgresql@15 mosquitto"
brew update
brew install openjdk@17 maven postgresql@15 mosquitto || true

echo "Collegamento OpenJDK in PATH temporaneo (aggiungi al tuo .zshrc se necessario):"
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' || true

echo "Avvio servizi PostgreSQL e Mosquitto"
brew services start postgresql@15 || true
brew services start mosquitto || true

echo "Creazione utente e database PostgreSQL (user: pissir, pwd: pissir, db: pissirdb)"
if command -v psql >/dev/null 2>&1; then
  psql -v ON_ERROR_STOP=1 <<-EOS || true
    CREATE USER pissir WITH PASSWORD 'pissir';
    CREATE DATABASE pissirdb OWNER pissir;
EOS
else
  echo "psql non disponibile immediatamente. Potrebbe essere necessario riaprire il terminale o aggiungere il binario di Postgres al PATH." >&2
fi

echo "Setup locale completato. Per avviare il backend Java esegui: ./run-backend-local.sh"
echo "Per avviare il server Node: node config/server.js"
