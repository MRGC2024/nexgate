'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { CreditCard, Banknote, FileText, QrCode, Save } from 'lucide-react';

type FeeConfig = {
  pixPercent: number;
  pixFixedCents: number;
  withdrawalFeeCents: number;
  withdrawalPercent: number;
  boletoPercent: number;
  boletoFixedCents: number;
  cardPercent: number;
  cardFixedCents: number;
};

const defaultConfig: FeeConfig = {
  pixPercent: 3.99,
  pixFixedCents: 199,
  withdrawalFeeCents: 0,
  withdrawalPercent: 0,
  boletoPercent: 6.99,
  boletoFixedCents: 299,
  cardPercent: 7.99,
  cardFixedCents: 299,
};

export default function AdminTaxasPage() {
  const [config, setConfig] = useState<FeeConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api<FeeConfig>('/fee-config')
      .then(setConfig)
      .catch(() => setConfig(defaultConfig))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await api('/fee-config', { method: 'PUT', body: JSON.stringify(config) });
      setMessage('Taxas salvas com sucesso.');
    } catch {
      setMessage('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function update(key: keyof FeeConfig, value: number) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Taxas" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Taxas' }]} />
        <div className="p-6">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Taxas"
        subtitle="Configure as taxas globais da plataforma"
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
          { label: 'Taxas' },
        ]}
      />
      <div className="p-6 space-y-6">
        {message && (
          <p className={`text-sm ${message.includes('sucesso') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>
        )}

        <div className="card max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold">Pix</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Porcentagem (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config.pixPercent}
                onChange={(e) => update('pixPercent', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Taxa fixa (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={(config.pixFixedCents / 100).toFixed(2)}
                onChange={(e) => update('pixFixedCents', Math.round(parseFloat(e.target.value || '0') * 100))}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold">Saque</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Taxa fixa (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={(config.withdrawalFeeCents / 100).toFixed(2)}
                onChange={(e) => update('withdrawalFeeCents', Math.round(parseFloat(e.target.value || '0') * 100))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Porcentagem (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config.withdrawalPercent}
                onChange={(e) => update('withdrawalPercent', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold">Boleto</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Porcentagem (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config.boletoPercent}
                onChange={(e) => update('boletoPercent', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Taxa fixa (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={(config.boletoFixedCents / 100).toFixed(2)}
                onChange={(e) => update('boletoFixedCents', Math.round(parseFloat(e.target.value || '0') * 100))}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold">Cartão</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Porcentagem (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config.cardPercent}
                onChange={(e) => update('cardPercent', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Taxa fixa (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={(config.cardFixedCents / 100).toFixed(2)}
                onChange={(e) => update('cardFixedCents', Math.round(parseFloat(e.target.value || '0') * 100))}
                className="input"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar taxas'}
        </button>
      </div>
    </div>
  );
}
