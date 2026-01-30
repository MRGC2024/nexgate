'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { hasRole } from '@/lib/api';

type Merchant = {
  id: string;
  name: string;
  slug: string;
  email?: string;
  document?: string;
  phone?: string;
  address?: string;
  active: boolean;
  registrationStatus?: string;
  withdrawalLimitCents?: number | null;
  withdrawalFeePercent?: number;
  withdrawalFeeFixedCents?: number;
  acquirerCode?: string | null;
  pixWithdrawalKey?: string | null;
};

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

const canEdit = () => hasRole('superadmin') || hasRole('gerencia');

export default function AdminMerchantDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<FullDetail | null>(null);
  const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Merchant>>({});
  const [feeForm, setFeeForm] = useState<Partial<FeeConfig>>({});
  const [message, setMessage] = useState<string | null>(null);

  const [documents, setDocuments] = useState<{ id: string; documentType: string; fileUrl: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api<FullDetail>(`/merchants/${id}/full-detail`),
      api<FeeConfig>(`/fee-config/merchant/${id}`).catch(() => null),
      api<{ id: string; documentType: string; fileUrl: string }[]>(`/merchants/${id}/documents`).catch(() => []),
    ])
      .then(([detail, fees, docs]) => {
        setData(detail);
        setFeeConfig(fees || null);
        setDocuments(Array.isArray(docs) ? docs : []);
        setForm({
          email: detail.merchant.email,
          phone: detail.merchant.phone,
          address: detail.merchant.address,
          active: detail.merchant.active,
          registrationStatus: detail.merchant.registrationStatus,
          withdrawalLimitCents: detail.merchant.withdrawalLimitCents ?? undefined,
          withdrawalFeePercent: detail.merchant.withdrawalFeePercent ?? 0,
          withdrawalFeeFixedCents: detail.merchant.withdrawalFeeFixedCents ?? 0,
          acquirerCode: detail.merchant.acquirerCode ?? '',
          pixWithdrawalKey: detail.merchant.pixWithdrawalKey ?? '',
        });
        setFeeForm(fees || {});
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveMerchant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api(`/merchants/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      setData((d) => (d ? { ...d, merchant: { ...d.merchant, ...form } } : null));
      setMessage('Empresa atualizada.');
      setEditing(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveFees(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api<FeeConfig>(`/fee-config/merchant/${id}`, {
        method: 'PUT',
        body: JSON.stringify(feeForm),
      });
      setFeeConfig(updated);
      setMessage('Taxas atualizadas.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao salvar taxas.');
    } finally {
      setSaving(false);
    }
  }

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
  const showEdit = canEdit();

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
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
        {message && (
          <p className={message.includes('Erro') ? 'text-sm text-red-500' : 'text-sm text-green-500'}>{message}</p>
        )}

        {/* Dados da empresa - edição completa (só admin/gerencia) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dados da empresa</h2>
            {showEdit && (
              <button type="button" onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
                {editing ? 'Cancelar' : 'Editar tudo'}
              </button>
            )}
          </div>
          {editing && showEdit ? (
            <form onSubmit={handleSaveMerchant} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Razão social (somente leitura)</label>
                  <p className="font-medium">{merchant.name}</p>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">CNPJ (somente leitura)</label>
                  <p className="font-medium">{merchant.document || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">E-mail</label>
                  <input type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Telefone</label>
                  <input type="text" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[var(--muted)] mb-1">Endereço</label>
                  <input type="text" value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Status cadastro</label>
                  <select value={form.registrationStatus ?? ''} onChange={(e) => setForm((f) => ({ ...f, registrationStatus: e.target.value }))} className="input">
                    <option value="pending_approval">Pendente</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Ativo</label>
                  <select value={form.active ? '1' : '0'} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === '1' }))} className="input">
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Limite de saque (R$)</label>
                  <input type="number" step="0.01" min="0" value={((form.withdrawalLimitCents ?? 0) / 100).toFixed(2)} onChange={(e) => setForm((f) => ({ ...f, withdrawalLimitCents: Math.round(parseFloat(e.target.value || '0') * 100) }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Taxa saque %</label>
                  <input type="number" step="0.01" min="0" value={form.withdrawalFeePercent ?? 0} onChange={(e) => setForm((f) => ({ ...f, withdrawalFeePercent: parseFloat(e.target.value || '0') }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Taxa saque fixo (R$)</label>
                  <input type="number" step="0.01" min="0" value={((form.withdrawalFeeFixedCents ?? 0) / 100).toFixed(2)} onChange={(e) => setForm((f) => ({ ...f, withdrawalFeeFixedCents: Math.round(parseFloat(e.target.value || '0') * 100) }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Adquirente / subadquirente</label>
                  <input type="text" value={form.acquirerCode ?? ''} onChange={(e) => setForm((f) => ({ ...f, acquirerCode: e.target.value || null }))} className="input" placeholder="ex: mock_pix, cielo" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Chave Pix para saque</label>
                  <input type="text" value={form.pixWithdrawalKey ?? ''} onChange={(e) => setForm((f) => ({ ...f, pixWithdrawalKey: e.target.value || null }))} className="input" placeholder="CPF, CNPJ, e-mail ou chave" />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar empresa'}</button>
            </form>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Email</dt>
                <dd className="font-medium">{merchant.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">CNPJ</dt>
                <dd className="font-medium">{merchant.document || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Telefone</dt>
                <dd className="font-medium">{merchant.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Status</dt>
                <dd className="font-medium">
                  {merchant.registrationStatus === 'pending_approval' ? 'Pendente' : merchant.registrationStatus === 'approved' ? 'Aprovado' : merchant.registrationStatus === 'rejected' ? 'Rejeitado' : '—'} · {merchant.active ? 'Ativo' : 'Inativo'}
                </dd>
              </div>
              {(merchant.withdrawalLimitCents != null || merchant.pixWithdrawalKey) && (
                <>
                  <div>
                    <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Limite saque</dt>
                    <dd className="font-medium">{merchant.withdrawalLimitCents != null ? `R$ ${(merchant.withdrawalLimitCents / 100).toLocaleString('pt-BR')}` : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Taxa saque</dt>
                    <dd className="font-medium">{(merchant.withdrawalFeePercent ?? 0)}% + R$ {((merchant.withdrawalFeeFixedCents ?? 0) / 100).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Adquirente</dt>
                    <dd className="font-medium">{merchant.acquirerCode || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Chave Pix saque</dt>
                    <dd className="font-medium truncate">{merchant.pixWithdrawalKey || '—'}</dd>
                  </div>
                </>
              )}
            </dl>
          )}
        </div>

        {/* Taxas por empresa (override do padrão) */}
        {showEdit && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Taxas desta empresa (override do padrão)</h2>
            <form onSubmit={handleSaveFees} className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Pix %</label>
                  <input type="number" step="0.01" value={feeForm.pixPercent ?? feeConfig?.pixPercent ?? ''} onChange={(e) => setFeeForm((f) => ({ ...f, pixPercent: parseFloat(e.target.value) }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Pix fixo (R$)</label>
                  <input type="number" step="0.01" value={feeForm.pixFixedCents != null ? (feeForm.pixFixedCents / 100).toFixed(2) : (feeConfig?.pixFixedCents ?? 0) / 100} onChange={(e) => setFeeForm((f) => ({ ...f, pixFixedCents: Math.round(parseFloat(e.target.value || '0') * 100) }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Boleto %</label>
                  <input type="number" step="0.01" value={feeForm.boletoPercent ?? feeConfig?.boletoPercent ?? ''} onChange={(e) => setFeeForm((f) => ({ ...f, boletoPercent: parseFloat(e.target.value) }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Cartão %</label>
                  <input type="number" step="0.01" value={feeForm.cardPercent ?? feeConfig?.cardPercent ?? ''} onChange={(e) => setFeeForm((f) => ({ ...f, cardPercent: parseFloat(e.target.value) }))} className="input" />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar taxas'}</button>
            </form>
          </div>
        )}

        {/* Documentos enviados */}
        {documents.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Documentos enviados</h2>
            <ul className="space-y-2">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--muted)]">{d.documentType}</span>
                  {d.fileUrl?.startsWith('data:') ? (
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Ver</a>
                  ) : (
                    <span className="text-[var(--muted)] truncate max-w-[200px]">{d.fileUrl}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transações */}
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
                    <td colSpan={5} className="text-center text-[var(--muted)] py-8">Nenhuma transação ainda.</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="font-mono text-sm">{t.externalRef}</td>
                      <td>{t.paymentMethod}</td>
                      <td>{(t.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: t.currency || 'BRL' })}</td>
                      <td><span className={t.status === 'paid' ? 'text-green-500' : 'text-amber-500'}>{t.status}</span></td>
                      <td className="text-[var(--muted)] text-sm">{new Date(t.createdAt).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/merchants" className="btn-secondary">Voltar às empresas</Link>
        </div>
      </div>
    </div>
  );
}
