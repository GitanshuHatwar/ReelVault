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
}

export const api = {
  signUp: (email, password) => request('/v1/auth/signup', { method: 'POST', body: { email, password }, auth: false }),
  signIn: (email, password) => request('/v1/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/v1/auth/me'),
  logout: () => request('/v1/auth/logout', { method: 'POST', body: { all_devices: false } }),
  saveReel: (url) => request('/v1/reels', { method: 'POST', body: { url } }),
  listReels: () => request('/v1/reels'),
  getReel: (reelId) => request(`/v1/reels/${reelId}`),
  deleteReel: (reelId) => request(`/v1/reels/${reelId}`, { method: 'DELETE' }),
  startResearch: (reelId, body = {}) => request(`/v1/reels/${reelId}/deep-cook`, { method: 'POST', body }),
  getResearch: (reelId) => request(`/v1/reels/${reelId}/deep-cook`),
  listSavedLinks: () => request('/v1/reels/saved-links'),
  saveLink: (reelId, body) => request(`/v1/reels/${reelId}/saved-links`, { method: 'POST', body }),
  deleteSavedLink: (linkId) => request(`/v1/reels/saved-links/${linkId}`, { method: 'DELETE' }),
  listSavedDates: () => request('/v1/reels/saved-dates'),
  saveDate: (reelId, body) => request(`/v1/reels/${reelId}/saved-dates`, { method: 'POST', body }),
  deleteSavedDate: (dateId) => request(`/v1/reels/saved-dates/${dateId}`, { method: 'DELETE' }),
};
