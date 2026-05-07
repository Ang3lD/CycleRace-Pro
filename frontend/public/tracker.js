class UserTracker {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.initListeners();
  }

  initListeners() {
    document.addEventListener('click', (e) => this.track('CLICK', e.target));
    window.addEventListener('popstate', () => this.track('NAVIGATE', { id: window.location.pathname }));
    
    // Track initial load
    this.track('NAVIGATE', { id: window.location.pathname });
  }

  track(actionType, element) {
    // Basic element identification
    let target = element.id;
    if (!target && element.tagName) {
      target = element.tagName.toLowerCase();
      if (element.className && typeof element.className === 'string') {
        target += '.' + element.className.split(' ')[0];
      }
    }
    if (!target) target = 'window';

    // Try to get user_id from localStorage (CycleRace Pro stores user info)
    let userId = 'anonymous';
    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.user && parsed.user.id) {
          userId = 'user_' + parsed.user.id;
        }
      }
    } catch (e) {}

    // Some custom mapping to make the compiler logic interesting
    if (actionType === 'CLICK' && element.innerText) {
      const text = element.innerText.toLowerCase();
      if (text.includes('iniciar sesión')) actionType = 'LOGIN';
      if (text.includes('guardar') || text.includes('validar') || text.includes('pagar')) actionType = 'SAVE';
    }

    const payload = {
      user_id: userId,
      action_type: actionType,
      target_element: target,
      timestamp: new Date().toISOString(),
      payload: { url: window.location.pathname }
    };

    // Fire and forget
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
    } else {
      fetch(this.endpoint, { method: 'POST', body: JSON.stringify(payload), keepalive: true }).catch(() => {});
    }
  }
}

// Iniciar tracker apuntando al microservicio Go (puerto 8081)
window.addEventListener('DOMContentLoaded', () => {
  window.cycleRaceTracker = new UserTracker('http://localhost:8081/ingest');
});
