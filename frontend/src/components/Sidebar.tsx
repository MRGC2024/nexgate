'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, getUser, isSuperadmin, hasRole } from '@/lib/api';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Receipt,
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
  Menu,
  X,
  UserCircle,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'gerencia', 'analise_risco'] },
  { href: '/admin/activity', label: 'Atividade', icon: Activity, roles: ['superadmin', 'analise_risco'] },
  { href: '/admin/merchants', label: 'Empresas', icon: Building2, roles: ['superadmin', 'gerencia', 'analise_risco'] },
  { href: '/admin/transactions', label: 'Transações', icon: ShoppingCart, roles: ['superadmin', 'gerencia', 'analise_risco'] },
  { href: '/admin/users', label: 'Usuários', icon: Users, roles: ['superadmin', 'gerencia', 'analise_risco'] },
  { href: '/admin/roles', label: 'Cargos', icon: Settings, roles: ['superadmin'] },
  { href: '/admin/connectors', label: 'Conectores', icon: Key, roles: ['superadmin'] },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook, roles: ['superadmin', 'gerencia'] },
  { href: '/admin/audit', label: 'Auditoria', icon: FileText, roles: ['superadmin', 'gerencia', 'analise_risco'] },
  { href: '/admin/taxas', label: 'Taxas', icon: Percent, roles: ['superadmin', 'gerencia'] },
  { href: '/docs', label: 'Documentação', icon: FileText, roles: ['superadmin', 'gerencia', 'analise_risco'] },
];

const merchantNav = [
  { href: '/merchant', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/merchant/recebimentos', label: 'Recebimentos', icon: Receipt },
  { href: '/merchant/transactions', label: 'Transações', icon: ShoppingCart },
  { href: '/merchant/taxas', label: 'Taxas', icon: Percent },
  { href: '/merchant/empresa', label: 'Minha Empresa', icon: Building2 },
  { href: '/merchant/documentos', label: 'Documentos', icon: FileText },
  { href: '/merchant/meus-dados', label: 'Meus dados', icon: UserCircle },
  { href: '/merchant/api-keys', label: 'Integrações', icon: Key },
  { href: '/merchant/connectors', label: 'Conectores', icon: Key },
  { href: '/merchant/routing', label: 'Regras', icon: Settings },
  { href: '/merchant/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/docs', label: 'Documentação', icon: FileText },
];

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const admin = isSuperadmin() || hasRole('gerencia') || hasRole('analise_risco');
  const nav = admin
    ? adminNav.filter((item) => !item.roles || item.roles.length === 0 || item.roles.some((r) => hasRole(r)))
    : merchantNav;

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function handleNavClick() {
    if (onClose) onClose();
  }

  return (
    <>
      <aside
        className={clsx(
          'flex flex-col border-r border-[var(--border)] bg-[var(--sidebar)]',
          'fixed md:static inset-y-0 left-0 z-50 w-64 min-h-screen',
          'transform transition-transform duration-200 ease-out md:transform-none',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] md:block">
          <Link
            href={admin ? '/admin' : '/merchant'}
            onClick={handleNavClick}
            className="flex items-center gap-2 font-semibold text-lg tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-bold text-sm">
              N
            </span>
            NEXGATE
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-3 -m-2 rounded-lg hover:bg-[var(--border)]/30 min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {user && (
          <div className="px-4 py-2 border-b border-[var(--border)] md:block">
            <p className="text-xs text-[var(--muted)] truncate" title={user.email}>
              {user.email}
            </p>
          </div>
        )}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition touch-manipulation',
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
            type="button"
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
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          aria-label="Fechar overlay"
        />
      )}
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="md:hidden p-3 -m-1 rounded-lg hover:bg-[var(--border)]/30 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation active:opacity-80"
      aria-label="Abrir menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
