'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

type Role = { id: string; name: string; description?: string; permissions?: { code: string }[] };

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    api<Role[]>('/users/roles/list')
      .then(setRoles)
      .catch(() => setRoles([]));
  }, []);

  return (
    <div>
      <DashboardHeader
        title="Cargos e acessos"
        subtitle="Gerencie os cargos e quais acessos cada um tem no gateway"
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
          { label: 'Cargos' },
        ]}
      />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">
            Atribua cargos aos usuários em <Link href="/admin/users" className="text-[var(--accent)] hover:underline">Usuários</Link>.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((r) => (
            <div key={r.id} className="card">
              <h3 className="font-semibold text-lg capitalize">{r.name.replace('_', ' ')}</h3>
              <p className="text-sm text-[var(--muted)] mt-1">{r.description || '—'}</p>
              {r.permissions?.length ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.permissions.slice(0, 6).map((p) => (
                    <span
                      key={p.code}
                      className="text-xs px-2 py-0.5 rounded bg-[var(--border)]/50 text-[var(--muted)]"
                    >
                      {p.code}
                    </span>
                  ))}
                  {r.permissions.length > 6 && (
                    <span className="text-xs text-[var(--muted)]">+{r.permissions.length - 6}</span>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        {roles.length === 0 && (
          <p className="text-center text-[var(--muted)] py-8">Nenhum cargo cadastrado.</p>
        )}
      </div>
    </div>
  );
}
