import {
  mockStore,
  isStaticAdmin,
  isMockSession,
  MOCK_ADMIN_USER,
  MOCK_ADMIN_SESSION,
} from './mockStore';

export {
  mockStore,
  isStaticAdmin,
  isMockSession,
  MOCK_ADMIN_USER,
  MOCK_ADMIN_SESSION,
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SESSION_KEY = 'reelvault_session';

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function errorMessage(payload, fallback) {
  const fromApp = payload?.error?.message;
  if (fromApp) return fromApp;
  const detail = payload?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(errorMessage(payload, 'The request could not be completed.'), {
      status: response.status,
      code: payload?.error?.code,
    });
  }
  return payload;
}

async function refreshSession(session) {
  const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const next = await parseResponse(response);
  setSession(next);
  return next;
}

async function request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  let session = getSession();
  const send = async () => {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  try {
    let response = await send();
    if (auth && retry && response.status === 401 && session?.refresh_token) {
      try {
        session = await refreshSession(session);
        response = await send();
      } catch {
        clearSession();
      }
    }
    return parseResponse(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Unable to connect to ReelVault API server. You can also log in as admin / admin for offline prototyping.',
      { status: 503 }
    );
  }
}

export const api = {
  signUp: (email, password) => {
    return request('/v1/auth/signup', { method: 'POST', body: { email, password }, auth: false });
  },

  signIn: async (email, password) => {
    if (isStaticAdmin(email, password)) {
      return MOCK_ADMIN_SESSION;
    }
    return request('/v1/auth/login', { method: 'POST', body: { email, password }, auth: false });
  },

  me: async () => {
    if (isMockSession()) {
      return MOCK_ADMIN_USER;
    }
    return request('/v1/auth/me');
  },

  logout: async () => {
    if (isMockSession()) {
      clearSession();
      return;
    }
    return request('/v1/auth/logout', { method: 'POST', body: { all_devices: false } });
  },

  saveReel: async (url) => {
    if (isMockSession()) {
      return mockStore.saveReel(url);
    }
    return request('/v1/reels', { method: 'POST', body: { url } });
  },

  listReels: async () => {
    if (isMockSession()) {
      return mockStore.getReels();
    }
    return request('/v1/reels');
  },

  getReel: async (reelId) => {
    if (isMockSession()) {
      const reel = mockStore.getReel(reelId);
      if (!reel) throw new ApiError('Reel not found', { status: 404 });
      return reel;
    }
    return request(`/v1/reels/${reelId}`);
  },

  deleteReel: async (reelId) => {
    if (isMockSession()) {
      return mockStore.deleteReel(reelId);
    }
    return request(`/v1/reels/${reelId}`, { method: 'DELETE' });
  },

  startResearch: async (reelId, body = {}) => {
    if (isMockSession()) {
      return mockStore.startResearch(reelId, body);
    }
    return request(`/v1/reels/${reelId}/deep-cook`, { method: 'POST', body });
  },

  getResearch: async (reelId) => {
    if (isMockSession()) {
      return mockStore.getResearch(reelId);
    }
    return request(`/v1/reels/${reelId}/deep-cook`);
  },

  listSavedLinks: async () => {
    if (isMockSession()) {
      return mockStore.getSavedLinks();
    }
    return request('/v1/reels/saved-links');
  },

  saveLink: async (reelId, body) => {
    if (isMockSession()) {
      return mockStore.saveLink(reelId, body);
    }
    return request(`/v1/reels/${reelId}/saved-links`, { method: 'POST', body });
  },

  deleteSavedLink: async (linkId) => {
    if (isMockSession()) {
      return mockStore.deleteSavedLink(linkId);
    }
    return request(`/v1/reels/saved-links/${linkId}`, { method: 'DELETE' });
  },

  listSavedDates: async () => {
    if (isMockSession()) {
      return mockStore.getSavedDates();
    }
    return request('/v1/reels/saved-dates');
  },

  saveDate: async (reelId, body) => {
    if (isMockSession()) {
      return mockStore.saveDate(reelId, body);
    }
    return request(`/v1/reels/${reelId}/saved-dates`, { method: 'POST', body });
  },

  deleteSavedDate: async (dateId) => {
    if (isMockSession()) {
      return mockStore.deleteSavedDate(dateId);
    }
    return request(`/v1/reels/saved-dates/${dateId}`, { method: 'DELETE' });
  },

  listLinkVault: async () => {
    if (isMockSession()) return mockStore.getLinkVaultEntries();
    return request('/v1/reels/link-vault');
  },

  saveLinkVault: async (reelId, body) => {
    if (isMockSession()) return mockStore.saveLinkVaultEntry(reelId, body);
    return request(`/v1/reels/${reelId}/link-vault`, { method: 'POST', body });
  },

  deleteLinkVault: async (entryId) => {
    if (isMockSession()) return mockStore.deleteLinkVaultEntry(entryId);
    return request(`/v1/reels/link-vault/${entryId}`, { method: 'DELETE' });
  },
};
