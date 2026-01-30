'use client';

import Link from 'next/link';
import { getUser } from '@/lib/api';

type Breadcrumb = { label: string; href?: string };

export default function DashboardHeader({
  title,
  subtitle,
  breadcrumbs = [],
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
}) {
  const user = getUser();
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]/50 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {breadcrumbs.length > 0 && (
            <nav className="text-xs text-[var(--muted)] mb-1 truncate">
              {breadcrumbs.map((b, i) => (
                <span key={i}>
                  {i > 0 && ' > '}
                  {b.href ? (
                    <Link href={b.href} className="hover:text-[var(--foreground)]">
                      {b.label}
                    </Link>
                  ) : (
                    b.label
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0 shrink-0">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-2 sm:px-3 py-1.5 min-w-0">
            <span
              className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-medium text-white"
              title={user?.email}
            >
              {initials}
            </span>
            <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[120px]">
              {user?.name || user?.email || 'Usuário'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
