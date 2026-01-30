'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { DollarSign, ShoppingCart, Wallet, TrendingUp } from 'lucide-react';

export default function MerchantDashboard() {
  const [transactions, setTransactions] = useState<{ id: string; amountCents: number; status: string; paymentMethod: string; createdAt: string }[]>([]);

  useEffect(() => {
    api<typeof transactions>('/transactions?limit=50').then(setTransactions).catch(() => setTransactions([]));
  }, []);

  const paid = Array.isArray(transactions) ? transactions.filter((t) => t.status === 'paid').length : 0;
  const total = Array.isArray(transactions)
    ? transactions.reduce((s, t) => (t.status === 'paid' ? s + t.amountCents : s), 0) / 100
    : 0;
  const ticketMedio = paid > 0 ? total / paid : 0;

  const kpis = [
    { label: 'Total em vendas', value: `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: 'durante este período!', icon: DollarSign },
    { label: 'Ticket médio', value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: `Em ${paid} vendas!`, icon: TrendingUp },
    { label: 'Pedidos pagos', value: String(paid), sub: 'durante este período!', icon: ShoppingCart },
    { label: 'Saldo disponível', value: 'R$ 0,00', sub: 'Solicitar saque →', icon: Wallet },
  ];

  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        subtitle="Veja o resumo de seu desempenho!"
        breadcrumbs={[
          { label: 'Home', href: '/merchant' },
          { label: 'Seller', href: '/merchant' },
          { label: 'Dashboard' },
        ]}
      />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="card">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-[var(--muted)]">{k.label}</span>
                  <Icon className="h-5 w-5 text-[var(--muted)]" />
                </div>
                <p className="text-2xl font-semibold mt-2">{k.value}</p>
                {k.sub && <p className="text-xs text-[var(--muted)] mt-1">{k.sub}</p>}
              </div>
            );
          })}
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Últimas transações</h2>
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
                {Array.isArray(transactions) && transactions.length > 0 ? (
                  transactions.slice(0, 10).map((t) => (
                    <tr key={t.id}>
                      <td className="font-medium">R$ {(t.amountCents / 100).toFixed(2)}</td>
                      <td>{t.paymentMethod}</td>
                      <td>{t.status}</td>
                      <td className="text-[var(--muted)]">{new Date(t.createdAt).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-[var(--muted)] py-6">Nenhuma transação ainda.</td>
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
