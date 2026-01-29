'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminMerchantsPage() {
  const [list, setList] = useState<{ id: string; name: string; slug: string; email?: string; active: boolean }[]>([]);

  useEffect(() => {
    api<typeof list>('/merchants').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Merchants</h1>
      <div className="card">
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.slug}</td>
                  <td>{m.email || '—'}</td>
                  <td>{m.active ? 'Ativo' : 'Inativo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
