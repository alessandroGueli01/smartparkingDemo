const API_BASE = window.location.origin || 'http://localhost:3000';

function getAuthHeaders() {
  const stored = localStorage.getItem('pissir_auth');
  if (!stored) return { 'Content-Type': 'application/json' };
  try {
    const obj = JSON.parse(stored);
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + obj.token };
  } catch (e) {
    return { 'Content-Type': 'application/json' };
  }
}

function formatApiError(data, fallbackMessage) {
  if (data && data.error) return data.error;
  if (typeof data === 'string' && data.trim()) return data;
  return fallbackMessage;
}

function getHomeForUser(user) {
  return user && user.tipo === 'admin' ? '/admin' : '/dashboard.html';
}

async function autoLoginAfterRegister(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password })
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }

    if (!res.ok) {
      return { ok: false, message: formatApiError(data, 'Accesso automatico non riuscito') };
    }

    localStorage.setItem('pissir_auth', JSON.stringify(data));
    window.location.href = getHomeForUser(data.user);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: 'Il server non è raggiungibile. Verifica che il progetto sia avviato e riprova.' };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const regBtn = document.getElementById('reg-btn');

  const showMessage = (title, message, type = 'info') => {
    const msg = [title, message].filter(Boolean).join(': ');
    if (type === 'error') {
      alert('Errore: ' + msg);
    } else {
      alert(msg);
    }
  };

  if (loginBtn) loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
      showMessage('Login', 'Inserisci username e password', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, password})
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (res.ok) {
        localStorage.setItem('pissir_auth', JSON.stringify(data));
        showMessage('Accesso riuscito', `${data.user?.username || username} - login completato`);
        window.location.href = getHomeForUser(data.user);
        return;
      }

      const msg = formatApiError(data, 'Credenziali non valide');
      if (res.status === 401) {
        showMessage('Login fallito', 'Username o password non corretti', 'error');
      } else if (res.status === 409) {
        showMessage('Login fallito', 'Utente già presente o richiesta non valida', 'error');
      } else {
        showMessage('Login fallito', msg, 'error');
      }
    } catch (error) {
      showMessage('Login fallito', 'Il server non è raggiungibile. Verifica che il progetto sia avviato e riprova.', 'error');
    }
  });

  if (regBtn) regBtn.addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const tipo = 'base';

    if (!username || !email || !password) {
      showMessage('Registrazione', 'Inserisci username, email e password', 'error');
      return;
    }

    if (!document.getElementById('reg-email').checkValidity()) {
      showMessage('Registrazione', 'Inserisci un indirizzo email valido', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, email, password, tipo})
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (res.ok) {
        const loginResult = await autoLoginAfterRegister(username, password);
        if (loginResult.ok) {
          showMessage('Registrazione completata', `${data.username || username} è stato registrato e autenticato correttamente`);
        } else {
          showMessage('Registrazione completata', `${data.username || username} è stato registrato correttamente. Esegui il login manuale.`, 'error');
        }
      } else if (res.status === 409) {
        showMessage('Registrazione fallita', 'Username o email già utilizzati', 'error');
      } else {
        showMessage('Registrazione fallita', formatApiError(data, 'Impossibile completare la registrazione'), 'error');
      }
    } catch (error) {
      showMessage('Registrazione fallita', 'Servizio non disponibile. Controlla che il server sia attivo e riprova.', 'error');
    }
  });
});

// Example helper to request charging (uses proxy path)
async function requestCharging(desiredPercent, targa, placeId) {
  const headers = getAuthHeaders();
  const body = { desiredPercent, targa, placeId };
  const res = await fetch(`${API_BASE}/api/java/charging/request`, { method: 'POST', headers, body: JSON.stringify(body) });
  return res.json();
}

// Example helper to get charging queue
async function getChargingQueue() {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/java/charging/queue`, { method: 'GET', headers });
  return res.json();
}

window.requestCharging = requestCharging;
window.getChargingQueue = getChargingQueue;

document.addEventListener('DOMContentLoaded', () => {
  const reqBtn = document.getElementById('req-charge-btn');
  const viewBtn = document.getElementById('view-queue-btn');
  const out = document.getElementById('action-output');

  if (reqBtn) reqBtn.addEventListener('click', async () => {
    const targa = document.getElementById('action-targa').value;
    const placeId = parseInt(document.getElementById('action-place').value || '1');
    const desiredPercent = parseInt(document.getElementById('action-percent').value || '80');
    out.textContent = 'Invio richiesta...';
    try {
      const r = await requestCharging(desiredPercent, targa, placeId);
      out.textContent = JSON.stringify(r, null, 2);
    } catch (e) {
      out.textContent = 'Errore: ' + e.message;
    }
  });

  if (viewBtn) viewBtn.addEventListener('click', async () => {
    out.textContent = 'Recupero coda...';
    try {
      const q = await getChargingQueue();
      out.textContent = JSON.stringify(q, null, 2);
    } catch (e) {
      out.textContent = 'Errore: ' + e.message;
    }
  });
});
