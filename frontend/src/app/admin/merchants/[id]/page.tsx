'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

type Transaction = {
  id: string;
  amountCents: number;
  currency: string;
  paymentMethod: string;
  status: string;
  externalRef: string;
  createdAt: string;
  paidAt?: string;
};

type FullDetail = {
  merchant: Merchant;
  transactions: Transaction[];
  transactionCount: number;
};

export default function AdminMerchantDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<FullDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api<FullDetail>(`/merchants/${id}/full-detail`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Carregando..." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Empresas', href: '/admin/merchants' }]} />
        <div className="p-6">Carregando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <DashboardHeader title="Empresa" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Empresas', href: '/admin/merchants' }]} />
        <div className="p-6">Empresa não encontrada.</div>
      </div>
    );
  }

  const { merchant, transactions, transactionCount } = data;

  return (
    <div>
      <DashboardHeader
        title={merchant.name}
        subtitle={merchant.slug}
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
          { label: 'Empresas', href: '/admin/merchants' },
          { label: merchant.name },
        ]}
      />
      <div className="p-6 space-y-6">
        <div className="card grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Email</p>
            <p className="font-medium">{merchant.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">CNPJ/Documento</p>
            <p className="font-medium">{merchant.document || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Telefone</p>
            <p className="font-medium">{merchant.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Status</p>
            <p className="font-medium">
              {merchant.registrationStatus === 'pending_approval'
                ? 'Pendente'
                : merchant.registrationStatus === 'approved'
                  ? 'Aprovado'
                  : merchant.registrationStatus === 'rejected'
                    ? 'Rejeitado'
                    : merchant.registrationStatus || '—'}{' '}
              · {merchant.active ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Transações ({transactionCount})</h2>
          <p className="text-sm text-[var(--muted)] mb-4">Últimas 100 transações.</p>
          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Método</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-[var(--muted)] py-8">
                      Nenhuma transação ainda.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="font-mono text-sm">{t.externalRef}</td>
                      <td>{t.paymentMethod}</td>
                      <td>
                        {(t.amountCents / 100).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: t.currency || 'BRL',
                        })}
                      </td>
                      <td>
                        <span
                          className={
                            t.status === 'paid'
                              ? 'text-green-500'
                              : t.status === 'created' || t.status === 'pending'
                                ? 'text-amber-500'
                                : 'text-[var(--muted)]'
                          }
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="text-[var(--muted)] text-sm">
                        {new Date(t.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/merchants" className="btn-secondary">
            Voltar às empresas
          </Link>
        </div>
      </div>
    </div>
  );
}
