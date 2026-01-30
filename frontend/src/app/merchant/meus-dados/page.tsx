'use client';

import { useEffect, useState } from 'react';
import { api, getUser, changePassword } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

type Merchant = {
  id: string;
  name: string;
  slug: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export default function MeusDadosPage() {
  const user = getUser();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.merchantId) return;
    api<Merchant>(`/merchants/${user.merchantId}`)
      .then((m) => {
        setMerchant(m);
        setPhone(m.phone ? formatPhone(String(m.phone).replace(/\D/g, '')) : '');
      })
      .catch(() => setMerchant(null));
  }, [user?.merchantId]);

  function formatPhone(value: string) {
    const v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2) return v ? `(${v}` : '';
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  }

  async function handleSavePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.merchantId) return;
    setPhoneMessage(null);
    setPhoneSaving(true);
    try {
      await api(`/merchants/${user.merchantId}`, {
        method: 'PUT',
        body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
      });
      setPhoneMessage('Telefone atualizado com sucesso.');
    } catch {
      setPhoneMessage('Erro ao salvar. Tente novamente.');
    } finally {
      setPhoneSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage('Senha alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : 'Erro ao alterar senha.');
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div>
      <DashboardHeader
        title="Meus dados"
        subtitle="Altere telefone e senha. Razão social, CNPJ, endereço e e-mail não podem ser alterados aqui."
        breadcrumbs={[
          { label: 'Home', href: '/merchant' },
          { label: 'Merchant', href: '/merchant' },
          { label: 'Meus dados' },
        ]}
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-2xl">
        {/* Dados somente leitura */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Dados da empresa (somente leitura)</h2>
          <dl className="grid gap-4 sm:grid-cols-1">
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Razão social</dt>
              <dd className="mt-1 font-medium">{merchant?.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">CNPJ</dt>
              <dd className="mt-1 font-medium">{merchant?.document || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">Endereço</dt>
              <dd className="mt-1 font-medium">{merchant?.address || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)] uppercase tracking-wider">E-mail</dt>
              <dd className="mt-1 font-medium">{merchant?.email || user?.email || '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Telefone editável */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Telefone</h2>
          <form onSubmit={handleSavePhone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="input max-w-xs"
                placeholder="(11) 99999-9999"
              />
            </div>
            {phoneMessage && (
              <p className={phoneMessage.includes('sucesso') ? 'text-sm text-green-500' : 'text-sm text-red-500'}>
                {phoneMessage}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={phoneSaving}>
              {phoneSaving ? 'Salvando...' : 'Salvar telefone'}
            </button>
          </form>
        </div>

        {/* Alterar senha */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Alterar senha</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Senha atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input max-w-xs"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input max-w-xs"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar nova senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input max-w-xs"
                required
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>
            {passwordMessage && (
              <p className={passwordMessage.includes('sucesso') ? 'text-sm text-green-500' : 'text-sm text-red-500'}>
                {passwordMessage}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={passwordSaving}>
              {passwordSaving ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
