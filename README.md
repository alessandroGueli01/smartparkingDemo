# Pissir

Sistema di gestione parcheggio smart con frontend web e backend Node/Java-ready.

## Obiettivo

Il progetto simula un sistema di parcheggio intelligente con:
- login e registrazione utente
- prenotazione di un posto auto o MWBOT
- controllo della disponibilità dei posti
- gestione della ricarica con costo dinamico in base alla batteria
- pagamento simulato e ricevuta di conferma
- dashboard amministratore per monitorare lo stato del parcheggio
- API REST e fallback locale per testare il flusso senza installare software esterno

## Struttura principale

- `config/` - configurazione server Express e route API
- `formlogin/` - frontend HTML/CSS/JS
- `class/` - modelli logici del progetto originario
- `services/` - servizi Node
- `java-backend/` - backend Java/Spring Boot (opzionale, non necessario per avvio locale minimo)
- `e2e/` - script di test end-to-end

## Requisiti minimi

Per farlo partire in locale senza installare software aggiuntivo:
- Node.js >= 18
- npm

Non sono necessari:
- Java
- Maven
- Docker
- PostgreSQL
- Mosquitto

## Dipendenze Node installate

Nel progetto sono usate queste dipendenze principali:

```json
{
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "axios": "^1.4.0",
  "express-session": "^1.17.3",
  "keycloak-connect": "^21.0.0",
  "body-parser": "^1.20.2",
  "cors": "^2.8.5",
  "mqtt": "^5.10.3",
  "pg": "^8.13.3",
  "pg-hstore": "^2.3.4",
  "sequelize": "^6.37.5"
}
```

## Installazione

Da cartella progetto:

```bash
cd pissir
npm install
```

## Avvio del server

```bash
cd pissir
npm run dev
```

Il server parte su:

```text
http://localhost:3000
```

La root serve automaticamente la pagina di login:

```text
http://localhost:3000/
```

## Funzionalità complete del progetto

### Auth e accesso

Il sistema supporta:
- registrazione utente
- login utente
- gestione degli errori per username già esistente o credenziali errate
- redirect automatico verso la pagina di prenotazione dopo login/registrazione
- logout e privacy al ritorno alla pagina iniziale

### Prenotazione e disponibilità

La pagina di prenotazione permette di:
- inserire targa e modello del veicolo
- scegliere il tipo di posto
- selezionare data e orario
- scegliere veicolo elettrico / MWBOT
- impostare la percentuale di batteria
- calcolare automaticamente il costo della ricarica e del totale
- assegnare un posto disponibile in base al tipo di veicolo
- aggiornare lo stato del posto dopo il pagamento

### Dashboard amministratore

La pagina admin mostra:
- numero di posti liberi, prenotati, occupati e in carica
- griglia completa del parcheggio
- stato dettagliato di ogni posto
- storico delle auto passate
- pagamenti registrati

### Persistenza in demo locale

Per non richiedere dipendenze esterne non previste durante il corso, i dati principali vengono salvati localmente in `localStorage`:
- stato dei posti
- pagamenti
- storico auto
- sessione autenticata dell’utente

Questo rende il progetto eseguibile in laboratorio senza PostgreSQL o Java attivi.

## Login e registrazione

Per impostazione predefinita, login e registrazione usano il backend locale Node e salvano gli account in `data/local-data.json`, anche se Java è avviato. Le password sono cifrate con `scrypt`.

Per inoltrare esplicitamente l’autenticazione al backend Java, imposta `PISSIR_AUTH_BACKEND=java` prima di avviare Node. Il backend locale resta disponibile come fallback se Java non è raggiungibile.

Le route di autenticazione disponibili sono:
- `/api/register`
- `/api/login`
- `/api/java/auth/register`
- `/api/java/auth/login`

Il fallback locale usa il file persistente `data/local-data.json` per:
- conservare gli account tra riavvii del server
- evitare duplicati con lo stesso username
- generare un token locale
- verificare il login con credenziali corrette

## Esempi di test

### Registrazione

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student01","password":"pass123","tipo":"base"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student01","password":"pass123"}'
```

## Nota sul backend Java

La cartella `java-backend/` contiene una versione più completa con Spring Boot, JWT e logica di MWbot. Tuttavia, per il funzionamento base del progetto universitario, non è obbligatorio installare Java o Maven.

L’obiettivo del fallback locale è consentire di:
- testare login/registrazione
- mostrare il flusso applicativo
- valutare la logica del parcheggio smart
- lavorare senza installazioni esterne non previste dal corso

## Verifica funzionale locale

Il progetto è stato verificato in locale con i controlli HTTP principali:
- root del sito: `200 OK`
- pagina di prenotazione: `200 OK`
- pagina admin: `200 OK`

Questo conferma che le pagine principali sono servite correttamente dal server Express.



### Porta 3000 occupata

```bash
lsof -i :3000
kill <PID>
```

### Il server non parte

```bash
cd pissir
npm install
npm run dev
```

### Proxy Java non disponibile

Non è un errore critico nel setup universitario: il fallback locale lo gestisce automaticamente.
Progetto sviluppato come demo di gestione parcheggio smart con architettura Node + API REST + frontend statico.
