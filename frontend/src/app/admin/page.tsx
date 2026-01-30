'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { DollarSign, ShoppingCart, Building2, TrendingUp } from 'lucide-react';

export default function AdminOverview() {
  const [merchants, setMerchants] = useState<{ id: string; name: string; slug: string; active: boolean }[]>([]);
  const [transactions, setTransactions] = useState<{ amountCents?: number; status?: string }[]>([]);

  useEffect(() => {
    api<typeof merchants>('/merchants').then(setMerchants).catch(() => setMerchants([]));
    api<typeof transactions>('/transactions?limit=50').then(setTransactions).catch(() => setTransactions([]));
  }, []);

  const totalVendas = Array.isArray(transactions)
    ? transactions
        .filter((t) => t.status === 'paid')
        .reduce((s, t) => s + (t.amountCents || 0), 0) / 100
    : 0;
  const qtdVendas = Array.isArray(transactions) ? transactions.filter((t) => t.status === 'paid').length : 0;
  const ticketMedio = qtdVendas > 0 ? totalVendas / qtdVendas : 0;

  const kpis = [
    { label: 'Total em vendas', value: `R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: 'durante este período!', icon: DollarSign },
    { label: 'Ticket médio', value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: `Em ${qtdVendas} vendas!`, icon: TrendingUp },
    { label: 'Pedidos pagos', value: String(qtdVendas), sub: 'durante este período!', icon: ShoppingCart },
    { label: 'Empresas', value: String(merchants.length), sub: `${merchants.filter((m) => m.active).length} ativas`, icon: Building2 },
  ];

  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        subtitle="Veja o resumo de seu desempenho!"
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Empresas</h2>
            <Link href="/admin/activity" className="text-sm text-[var(--accent)] hover:underline">
              Ver atividade do gateway
            </Link>
          </div>
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
                    <td className="font-medium">{m.name}</td>
                    <td className="text-[var(--muted)]">{m.slug}</td>
                    <td>
                      <span className={m.active ? 'text-green-500' : 'text-red-500'}>
                        {m.active ? 'Ativo' : 'Inativo'}
                      </span>
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
