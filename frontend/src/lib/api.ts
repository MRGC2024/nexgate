const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api-backend';

/** Para debug: qual URL o front está usando (aparece na tela de login quando dá erro). */
export function getApiBase(): string {
  return typeof window !== 'undefined' ? API_BASE : (process.env.NEXT_PUBLIC_API_URL || '/api-backend');
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || String(res.status));
  }
  return res.json().catch(() => ({} as T));
}

export async function login(email: string, password: string) {
  const data = await api<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export type RegisterPayload = {
  name: string;
  document: string;
  email: string;
  phone: string;
  password: string;
};

export async function register(payload: RegisterPayload) {
  const res = await fetch(`${typeof window !== 'undefined' ? getApiBase() : API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || String(res.status));
  }
  return res.json().catch(() => ({}));
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return api<{ message: string }>('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export function getUser(): { id: string; email: string; name: string; merchantId?: string; roles: string[] } | null {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export function isSuperadmin(): boolean {
  const u = getUser();
  return !!u?.roles?.includes('superadmin');
}

export function hasRole(role: string): boolean {
  const u = getUser();
  return !!u?.roles?.includes(role);
}

/** true se ver painel admin (superadmin, gerencia ou analise_risco) */
export function isAdminPanel(): boolean {
  const u = getUser();
  if (!u?.roles?.length) return false;
  return u.roles.some((r) => ['superadmin', 'gerencia', 'analise_risco'].includes(r));
}
