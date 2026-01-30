'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

type Merchant = {
  id: string;
  name: string;
  slug: string;
  email?: string;
  document?: string;
  phone?: string;
  active: boolean;
  registrationStatus?: string;
};

export default function AdminMerchantsPage() {
  const [list, setList] = useState<Merchant[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    api<Merchant[]>('/merchants').then(setList).catch(() => setList([]));
  }, []);

  const filtered =
    filter === 'pending'
      ? list.filter((m) => m.registrationStatus === 'pending_approval')
      : filter === 'approved'
        ? list.filter((m) => m.registrationStatus === 'approved')
        : list;

  async function toggleActive(m: Merchant) {
    try {
      await api(`/merchants/${m.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !m.active }),
      });
      setList((prev) => prev.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)));
    } catch {
      // ignore
    }
  }

  async function approve(m: Merchant) {
    try {
      await api(`/merchants/${m.id}/approve`, { method: 'POST' });
      setList((prev) => prev.map((x) => (x.id === m.id ? { ...x, registrationStatus: 'approved', active: true } : x)));
    } catch {
      // ignore
    }
  }

  async function reject(m: Merchant) {
    try {
      await api(`/merchants/${m.id}/reject`, { method: 'POST' });
      setList((prev) => prev.map((x) => (x.id === m.id ? { ...x, registrationStatus: 'rejected', active: false } : x)));
    } catch {
      // ignore
    }
  }

  function statusLabel(s?: string) {
    if (!s) return '—';
    if (s === 'pending_approval') return 'Pendente';
    if (s === 'approved') return 'Aprovado';
    if (s === 'rejected') return 'Rejeitado';
    return s;
  }

  return (
    <div>
      <DashboardHeader
        title="Empresas"
        subtitle="Gerencie empresas e aprove cadastros pendentes"
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
          { label: 'Empresas' },
        ]}
      />
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'all' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)] border border-[var(--border)]'}`}
          >
            Todas ({list.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-[var(--card)] border border-[var(--border)]'}`}
          >
            Pendentes ({list.filter((m) => m.registrationStatus === 'pending_approval').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-[var(--card)] border border-[var(--border)]'}`}
          >
            Aprovadas ({list.filter((m) => m.registrationStatus === 'approved').length})
          </button>
        </div>
        <div className="card">
          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Email</th>
                  <th>Cadastro</th>
                  <th>Ativo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">
                      <Link href={`/admin/merchants/${m.id}`} className="hover:text-[var(--accent)]">
                        {m.name}
                      </Link>
                    </td>
                    <td className="text-[var(--muted)]">{m.slug}</td>
                    <td>{m.email || '—'}</td>
                    <td>
                      <span
                        className={
                          m.registrationStatus === 'pending_approval'
                            ? 'text-amber-500'
                            : m.registrationStatus === 'approved'
                              ? 'text-green-500'
                              : m.registrationStatus === 'rejected'
                                ? 'text-red-500'
                                : ''
                        }
                      >
                        {statusLabel(m.registrationStatus)}
                      </span>
                    </td>
                    <td>
                      <span className={m.active ? 'text-green-500' : 'text-red-500'}>
                        {m.active ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="space-x-2">
                      <Link
                        href={`/admin/merchants/${m.id}`}
                        className="text-sm text-[var(--accent)] hover:underline"
                      >
                        Ver tudo
                      </Link>
                      {m.registrationStatus === 'pending_approval' && (
                        <>
                          <button
                            type="button"
                            onClick={() => approve(m)}
                            className="text-sm text-green-500 hover:underline"
                          >
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => reject(m)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      {m.registrationStatus === 'approved' && (
                        <button
                          type="button"
                          onClick={() => toggleActive(m)}
                          className={m.active ? 'text-sm text-red-500 hover:underline' : 'text-sm text-green-500 hover:underline'}
                        >
                          {m.active ? 'Desativar' : 'Ativar'}
                        </button>
                      )}
                    </td>
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
