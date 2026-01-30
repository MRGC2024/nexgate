'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

type User = { id: string; email: string; name: string; merchantId?: string; roles?: { name: string }[] };
type Merchant = { id: string; name: string; slug: string };

export default function AdminUsersPage() {
  const [list, setList] = useState<User[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', merchantId: '', roleNames: ['merchant_admin'] as string[] });

  useEffect(() => {
    api<User[]>('/users').then(setList).catch(() => setList([]));
    api<Merchant[]>('/merchants').then(setMerchants).catch(() => setMerchants([]));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          merchantId: form.merchantId || undefined,
          roleNames: form.roleNames,
        }),
      });
      setShowForm(false);
      setForm({ email: '', password: '', name: '', merchantId: '', roleNames: ['merchant_admin'] });
      const users = await api<User[]>('/users');
      setList(users);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  }

  return (
    <div>
      <DashboardHeader
        title="Usuários"
        subtitle="Adicione usuários e defina cargos e acessos"
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
          { label: 'Usuários' },
        ]}
      />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">Cada usuário tem seu acesso conforme o cargo em Cargos e acessos.</p>
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
            Adicionar usuário
          </button>
        </div>
        {showForm && (
          <div className="card max-w-md">
            <h3 className="font-semibold mb-4">Novo usuário</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Empresa (opcional)</label>
                <select
                  className="input"
                  value={form.merchantId}
                  onChange={(e) => setForm((f) => ({ ...f, merchantId: e.target.value }))}
                >
                  <option value="">— Nenhuma —</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <select
                  className="input"
                  value={form.roleNames[0]}
                  onChange={(e) => setForm((f) => ({ ...f, roleNames: [e.target.value] }))}
                >
                  <option value="merchant_admin">Merchant Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Criar</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}
        <div className="card">
          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Merchant</th>
                  <th>Cargos</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td className="text-[var(--muted)]">{u.email}</td>
                    <td className="font-mono text-xs">{u.merchantId || '—'}</td>
                    <td>{(u.roles || []).map((r) => r.name).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
