'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, getUser, isSuperadmin } from '@/lib/api';
import clsx from 'clsx';

const adminNav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/merchants', label: 'Merchants' },
  { href: '/admin/transactions', label: 'Transações' },
  { href: '/admin/connectors', label: 'Conectores' },
  { href: '/admin/webhooks', label: 'Webhooks' },
  { href: '/admin/users', label: 'Usuários' },
  { href: '/admin/audit', label: 'Auditoria' },
];

const merchantNav = [
  { href: '/merchant', label: 'Dashboard' },
  { href: '/merchant/transactions', label: 'Transações' },
  { href: '/merchant/webhooks', label: 'Webhooks' },
  { href: '/merchant/api-keys', label: 'API Keys' },
  { href: '/merchant/connectors', label: 'Conectores' },
  { href: '/merchant/routing', label: 'Regras' },
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
    <aside className="w-56 border-r border-[var(--border)] bg-white dark:bg-zinc-900 min-h-screen flex flex-col">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href={admin ? '/admin' : '/merchant'} className="font-semibold text-lg tracking-tight">
          NEXGATE
        </Link>
        {user && (
          <p className="text-xs text-[var(--muted)] mt-1 truncate" title={user.email}>
            {user.email}
          </p>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'block px-3 py-2 rounded-md text-sm font-medium transition',
              pathname === item.href
                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'text-[var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-[var(--border)]">
        <button onClick={handleLogout} className="btn-secondary w-full text-sm">
          Sair
        </button>
      </div>
    </aside>
  );
}
