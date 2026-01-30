'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as apiRegister, getApiBase } from '@/lib/api';

export default function CadastroPage() {
  const [empresa, setEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  function formatCnpj(value: string) {
    const v = value.replace(/\D/g, '').slice(0, 14);
    if (v.length <= 2) return v;
    if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
    if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
    if (v.length <= 12) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`;
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
  }

  function formatPhone(value: string) {
    const v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2) return v ? `(${v}` : '';
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setErrorDetail(null);
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await apiRegister({
        name: empresa,
        document: cnpj.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        phone: telefone.replace(/\D/g, ''),
        password,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no cadastro';
      setError(msg === 'Failed to fetch'
        ? 'Não foi possível conectar à API. Verifique a conexão.'
        : msg);
      setErrorDetail(msg === 'Failed to fetch' ? getApiBase() : null);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md card text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Conta criada com sucesso</h1>
          <p className="text-[var(--muted)] mb-6">
            Seu cadastro foi enviado para análise. Em até 48 horas úteis você receberá um e-mail com o resultado. Após a aprovação, você poderá acessar o painel e enviar os documentos complementares.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 safe-area-padding">
      <div className="w-full max-w-md min-w-0">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-[var(--foreground)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white text-sm font-bold">N</span>
            NEXGATE
          </Link>
        </div>
        <div className="card">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Criar conta</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Preencha os dados da sua empresa. Após o cadastro, você enviará os documentos para aprovação.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da empresa</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="input"
                required
                placeholder="Razão social ou nome fantasia"
                autoComplete="organization"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                className="input"
                required
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                placeholder="contato@empresa.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                className="input"
                required
                placeholder="(11) 99999-9999"
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
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
                placeholder="Repita a senha"
                autoComplete="new-password"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 space-y-1">
                <p>{error}</p>
                {errorDetail && (
                  <p className="text-xs break-all text-[var(--muted)]">URL: {errorDetail}</p>
                )}
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-3 rounded-lg" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>
          <p className="mt-6 text-xs text-[var(--muted)] text-center">
            Já tem conta?{' '}
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
