'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function MerchantDashboard() {
  const [transactions, setTransactions] = useState<{ id: string; amountCents: number; status: string; paymentMethod: string; createdAt: string }[]>([]);

  useEffect(() => {
    api<typeof transactions>('/transactions?limit=10').then(setTransactions).catch(() => {});
  }, []);

  const paid = transactions.filter((t) => t.status === 'paid').length;
  const total = transactions.reduce((s, t) => (t.status === 'paid' ? s + t.amountCents : s), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Transações pagas (últimas 10)</p>
          <p className="text-2xl font-semibold mt-1">{paid}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Total (últimas 10)</p>
          <p className="text-2xl font-semibold mt-1">R$ {(total / 100).toFixed(2)}</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-medium mb-4">Últimas transações</h2>
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Valor</th>
                <th>Método</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>R$ {(t.amountCents / 100).toFixed(2)}</td>
                  <td>{t.paymentMethod}</td>
                  <td>{t.status}</td>
                  <td className="text-[var(--muted)]">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
