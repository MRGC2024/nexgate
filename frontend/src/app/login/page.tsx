'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, isAdminPanel, shouldUseMerchantPanel, getApiBase } from '@/lib/api';

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
      if (shouldUseMerchantPanel()) router.push('/merchant');
      else if (isAdminPanel()) router.push('/admin');
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 safe-area-padding">
      <div className="w-full max-w-sm min-w-0">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-[var(--foreground)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white text-sm font-bold">N</span>
            NEXGATE
          </Link>
        </div>
        <div className="card">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Entrar</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Use seu e-mail e senha para acessar o painel.</p>
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
              placeholder="••••••••"
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
          <p className="mt-4 text-xs text-[var(--muted)] text-center">
            Não tem conta? <Link href="/cadastro" className="text-[var(--accent)] hover:underline">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
