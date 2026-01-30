'use client';

import DashboardHeader from '@/components/DashboardHeader';
import { CreditCard, FileText, QrCode } from 'lucide-react';

const taxas = [
  { metodo: 'Pix', desc: 'Receba pagamentos instantâneos', taxa: '3,99 % + R$ 1,99 / transação', disponivel: true, icon: QrCode },
  { metodo: 'Cartão de Crédito', desc: 'Veja as taxas por parcela, clique aqui!', taxa: '7,99 % + R$ 2,99 / transação', reserva: '25%', disponivel: false, icon: CreditCard },
  { metodo: 'Boleto', desc: 'Boletos emitidos não são cobrados, apenas os pagos.', taxa: '6,99 % + R$ 2,99 / transação', reserva: '15%', disponivel: false, icon: FileText },
];

export default function MerchantTaxasPage() {
  return (
    <div>
      <DashboardHeader
        title="Taxas"
        subtitle="Veja detalhadamente as taxas da plataforma"
        breadcrumbs={[
          { label: 'Home', href: '/merchant' },
          { label: 'Seller', href: '/merchant' },
          { label: 'Taxas' },
        ]}
      />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {taxas.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.metodo} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/20 text-[var(--accent)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{t.metodo}</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                  <span className={t.disponivel ? 'text-xs text-green-500 font-medium' : 'text-xs text-red-500 font-medium'}>
                    {t.disponivel ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium">{t.taxa}</p>
                {t.reserva && <p className="text-xs text-[var(--muted)] mt-1">Reserva financeira de {t.reserva}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
