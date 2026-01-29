'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminOverview() {
  const [merchants, setMerchants] = useState<{ id: string; name: string; slug: string; active: boolean }[]>([]);
  const [transactions, setTransactions] = useState<unknown[]>([]);

  useEffect(() => {
    api<{ id: string; name: string; slug: string; active: boolean }[]>('/merchants')
      .then(setMerchants)
      .catch(() => {});
    api<unknown[]>('/transactions?limit=5').then(setTransactions).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Merchants</p>
          <p className="text-2xl font-semibold mt-1">{merchants.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Transações (últimas)</p>
          <p className="text-2xl font-semibold mt-1">{Array.isArray(transactions) ? transactions.length : 0}</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-medium mb-4">Merchants</h2>
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.slug}</td>
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
