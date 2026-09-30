Java backend minimal per il progetto PISSIR

Prerequisiti:
- Java 17
- Maven
- Un broker MQTT in ascolto su tcp://localhost:1883 (es. Mosquitto)

Esecuzione:

```
cd java-backend
mvn spring-boot:run
```

Endpoint principali:
- POST /api/auth/register {username,password,tipo}
- POST /api/auth/login {username,password}
- POST /api/bookings crea prenotazione
- POST /api/charging/request richiede ricarica
- GET /api/charging/queue vede la coda di ricarica
- GET /api/admin/payments?from=2026-09-01T00:00:00&to=2026-09-30T23:59:59

Nota: autenticazione minima (non sicura) è via body della richiesta oppure header X-User-Id nelle chiamate successive.

Docker (sviluppo con Postgres + Mosquitto)
---------------------------------------

Per avviare i servizi di sviluppo (Postgres + Mosquitto) usa Docker Compose dalla root del progetto:

```bash
docker compose up -d
```

Configurazione Postgres per il backend Java (environment variables):

- `SPRING_DATASOURCE_URL` es. `jdbc:postgresql://localhost:5432/pissirdb`
- `SPRING_DATASOURCE_USERNAME` es. `pissir`
- `SPRING_DATASOURCE_PASSWORD` es. `pissir`
- `JWT_SECRET` segreto per firmare i token JWT

Esempio per avviare il backend con Postgres del compose:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/pissirdb
export SPRING_DATASOURCE_USERNAME=pissir
export SPRING_DATASOURCE_PASSWORD=pissir
export JWT_SECRET="sostituisciconunsegretoforte"
cd java-backend
mvn spring-boot:run
```

Endpoint di login ora restituisce un JSON con `token` e `user` (JWT). Usa l'header `Authorization: Bearer <token>` per chiamate protette.

Esecuzione senza Docker (macOS con Homebrew)
-------------------------------------------
Se non puoi installare Docker puoi usare Homebrew per installare Postgres, Mosquitto e Maven, e avviare il backend localmente.

1. Esegui lo script di setup locale (richiede Homebrew):

```bash
./local-setup.sh
```

2. Avvia il backend Java (usa Maven locale o, se non disponibile, un container Maven):

```bash
./run-backend-local.sh
```

3. Avvia il server Node:

```bash
node config/server.js
```

4. Esegui lo script E2E (opzionale):

```bash
./e2e/test_e2e.sh
```

Nota: lo script `local-setup.sh` prova a creare l'utente e il DB PostgreSQL `pissirdb` con user `pissir` e password `pissir`.

