'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Tx = {
  id: string;
  merchantId: string;
  amountCents: number;
  currency: string;
  paymentMethod: string;
  status: string;
  externalRef: string;
  createdAt: string;
};

export default function AdminTransactionsPage() {
  const [list, setList] = useState<Tx[]>([]);

  useEffect(() => {
    api<Tx[]>('/transactions?limit=50').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Transações (global)</h1>
      <div className="card">
        <div className="table-container overflow-x-auto">
          <table className="table w-full min-w-[640px]">
            <thead>
              <tr>
                <th>ID</th>
                <th>Merchant</th>
                <th>Valor</th>
                <th>Método</th>
                <th>Status</th>
                <th>Ref</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs truncate max-w-[120px]">{t.id}</td>
                  <td className="font-mono text-xs truncate max-w-[100px]">{t.merchantId}</td>
                  <td>{(t.amountCents / 100).toFixed(2)} {t.currency}</td>
                  <td>{t.paymentMethod}</td>
                  <td>{t.status}</td>
                  <td>{t.externalRef}</td>
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
