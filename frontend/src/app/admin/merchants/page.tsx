'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

type Merchant = { id: string; name: string; slug: string; email?: string; active: boolean };

export default function AdminMerchantsPage() {
  const [list, setList] = useState<Merchant[]>([]);

  useEffect(() => {
    api<Merchant[]>('/merchants').then(setList).catch(() => setList([]));
  }, []);

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

  return (
    <div>
      <DashboardHeader
        title="Empresas"
        subtitle="Ative e desative empresas no gateway"
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
          { label: 'Empresas' },
        ]}
      />
      <div className="p-6">
        <div className="card">
          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.name}</td>
                    <td className="text-[var(--muted)]">{m.slug}</td>
                    <td>{m.email || '—'}</td>
                    <td>
                      <span className={m.active ? 'text-green-500' : 'text-red-500'}>
                        {m.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleActive(m)}
                        className={m.active ? 'text-red-500 hover:underline text-sm' : 'text-green-500 hover:underline text-sm'}
                      >
                        {m.active ? 'Desativar' : 'Ativar'}
                      </button>
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
