'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { Wallet, Clock, Hourglass, Building2 } from 'lucide-react';

export default function MerchantRecebimentosPage() {
  const [txs, setTxs] = useState<unknown[]>([]);

  useEffect(() => {
    api<unknown[]>('/transactions?limit=20').then(setTxs).catch(() => setTxs([]));
  }, []);

  const cards = [
    { label: 'Saldo disponível', value: 'R$ 0,00', sub: 'Solicitar saque · Depositar', icon: Wallet },
    { label: 'Saldo pendente', value: 'R$ 0,00', sub: 'Solicitar antecipação', icon: Clock },
    { label: 'Aguardando antecipação', value: 'R$ 0,00', icon: Hourglass },
    { label: 'Reserva financeira', value: 'R$ 0,00', icon: Building2 },
  ];

  return (
    <div>
      <DashboardHeader
        title="Recebimentos"
        subtitle="Acompanhe suas taxas, saldos e solicite saques e antecipações"
        breadcrumbs={[
          { label: 'Home', href: '/merchant' },
          { label: 'Seller', href: '/merchant' },
          { label: 'Recebimentos' },
        ]}
      />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="card">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-[var(--muted)]">{c.label}</span>
                  <Icon className="h-5 w-5 text-[var(--muted)]" />
                </div>
                <p className="text-xl font-semibold mt-2">{c.value}</p>
                {c.sub && <p className="text-xs text-[var(--accent)] mt-1">{c.sub}</p>}
              </div>
            );
          })}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Extrato (últimas transações)</h2>
          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID / Ref</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(txs) && txs.length > 0 ? (
                  (txs as Record<string, unknown>[]).slice(0, 10).map((t, i) => (
                    <tr key={(t.id as string) || i}>
                      <td className="font-mono text-xs">{String(t.externalRef || t.id || '—')}</td>
                      <td>R$ {Number(t.amountCents || 0) / 100}</td>
                      <td>{String(t.status || '—')}</td>
                      <td className="text-[var(--muted)]">
                        {t.createdAt ? new Date(t.createdAt as string).toLocaleString('pt-BR') : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-[var(--muted)] py-6">
                      Nenhuma transação ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
