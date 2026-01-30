'use client';

import { useEffect, useState } from 'react';
import { api, getUser } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

type Merchant = {
  id: string;
  name: string;
  slug: string;
  document?: string;
  email?: string;
  accentColor?: string;
  active?: boolean;
};

export default function MerchantEmpresaPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user?.merchantId) return;
    api<Merchant>(`/merchants/${user.merchantId}`)
      .then(setMerchant)
      .catch(() => setMerchant(null));
  }, []);

  return (
    <div>
      <DashboardHeader
        title="Minha Empresa"
        subtitle="Veja e edite os dados da sua empresa"
        breadcrumbs={[
          { label: 'Home', href: '/merchant' },
          { label: 'Seller', href: '/merchant' },
          { label: 'Minha Empresa' },
        ]}
      />
      <div className="p-6 space-y-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Informações da empresa</h2>
          <p className="text-sm text-[var(--muted)] mb-4">Configure as principais informações sobre a sua empresa.</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">CPF/CNPJ</dt>
              <dd className="mt-1 font-medium">{merchant?.document || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Razão social</dt>
              <dd className="mt-1 font-medium">{merchant?.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Nome comercial</dt>
              <dd className="mt-1 font-medium">{merchant?.slug || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">E-mail</dt>
              <dd className="mt-1 font-medium">{merchant?.email || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
