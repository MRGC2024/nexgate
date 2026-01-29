'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Tx = {
  id: string;
  amountCents: number;
  currency: string;
  paymentMethod: string;
  status: string;
  externalRef: string;
  providerCode?: string;
  createdAt: string;
  paidAt?: string;
};

export default function MerchantTransactionsPage() {
  const [list, setList] = useState<Tx[]>([]);

  useEffect(() => {
    api<Tx[]>('/transactions?limit=50').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Transações</h1>
      <div className="card">
        <div className="table-container overflow-x-auto">
          <table className="table w-full min-w-[600px]">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Valor</th>
                <th>Método</th>
                <th>Status</th>
                <th>Conector</th>
                <th>Criado</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>{t.externalRef}</td>
                  <td>{(t.amountCents / 100).toFixed(2)} {t.currency}</td>
                  <td>{t.paymentMethod}</td>
                  <td>{t.status}</td>
                  <td className="font-mono text-xs">{t.providerCode || '—'}</td>
                  <td className="text-[var(--muted)]">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="text-[var(--muted)]">{t.paidAt ? new Date(t.paidAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
