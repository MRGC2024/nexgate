'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, isSuperadmin, getApiBase } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setErrorDetail(null);
    setLoading(true);
    try {
      await login(email, password);
      if (isSuperadmin()) router.push('/admin');
      else router.push('/merchant');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no login';
      setError(msg === 'Failed to fetch'
        ? 'Não foi possível conectar à API. Verifique NEXT_PUBLIC_API_URL (Vercel) e CORS_ORIGINS (Railway).'
        : msg);
      setErrorDetail(msg === 'Failed to fetch' ? getApiBase() : null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm card">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">NEXGATE</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 space-y-1">
              <p>{error}</p>
              {errorDetail && (
                <p className="text-xs break-all text-zinc-600 dark:text-zinc-400">
                  URL usada: {errorDetail}
                  <br />
                  <a
                    href={`${errorDetail.replace(/\/$/, '')}/health`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Abrir /health no navegador
                  </a>
                </p>
              )}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Demo: admin@nexgate.local / admin123 ou demo@nexgate.local / demo123
        </p>
      </div>
    </div>
  );
}
