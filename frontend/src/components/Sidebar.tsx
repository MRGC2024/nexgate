'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, getUser, isSuperadmin } from '@/lib/api';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Percent,
  Users,
  Building2,
  Key,
  FileText,
  Activity,
  ShoppingCart,
  Webhook,
  Settings,
  Moon,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/activity', label: 'Atividade do gateway', icon: Activity },
  { href: '/admin/merchants', label: 'Empresas', icon: Building2 },
  { href: '/admin/transactions', label: 'Transações', icon: ShoppingCart },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/roles', label: 'Cargos e acessos', icon: Settings },
  { href: '/admin/connectors', label: 'Conectores', icon: Key },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/admin/audit', label: 'Auditoria', icon: FileText },
  { href: '/admin/taxas', label: 'Taxas', icon: Percent },
  { href: '/docs', label: 'Documentação', icon: FileText },
];

const merchantNav = [
  { href: '/merchant', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/merchant/recebimentos', label: 'Recebimentos', icon: Receipt },
  { href: '/merchant/transactions', label: 'Transações', icon: ShoppingCart },
  { href: '/merchant/taxas', label: 'Taxas', icon: Percent },
  { href: '/merchant/empresa', label: 'Minha Empresa', icon: Building2 },
  { href: '/merchant/api-keys', label: 'Integrações', icon: Key },
  { href: '/merchant/connectors', label: 'Conectores', icon: Key },
  { href: '/merchant/routing', label: 'Regras', icon: Settings },
  { href: '/merchant/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/docs', label: 'Documentação', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const admin = isSuperadmin();
  const nav = admin ? adminNav : merchantNav;

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <aside
      className={clsx(
        'w-64 min-h-screen flex flex-col border-r border-[var(--border)]',
        'bg-[var(--sidebar)]'
      )}
    >
      <div className="p-4 border-b border-[var(--border)]">
        <Link
          href={admin ? '/admin' : '/merchant'}
          className="flex items-center gap-2 font-semibold text-lg tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-bold text-sm">
            N
          </span>
          NEXGATE
        </Link>
        {user && (
          <p className="text-xs text-[var(--muted)] mt-2 truncate" title={user.email}>
            {user.email}
          </p>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                isActive
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-[var(--border)]/30 hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--border)]/30 hover:text-[var(--foreground)] transition"
        >
          Sair
        </button>
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--muted)]">
          <Moon className="h-4 w-4" />
          Tema escuro
        </div>
      </div>
    </aside>
  );
}
