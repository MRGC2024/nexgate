'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

type AuditItem = {
  id: string;
  action: string;
  resource?: string;
  resourceId?: string;
  userId?: string;
  merchantId?: string;
  createdAt: string;
};

export default function AdminActivityPage() {
  const [list, setList] = useState<AuditItem[]>([]);

  useEffect(() => {
    api<AuditItem[]>('/audit?limit=100')
      .then(setList)
      .catch(() => setList([]));
  }, []);

  return (
    <div>
      <DashboardHeader
        title="Atividade do gateway"
        subtitle="Tudo que está acontecendo no seu gateway"
        breadcrumbs={[
          { label: 'Home', href: '/admin' },
          { label: 'Admin', href: '/admin' },
          { label: 'Atividade' },
        ]}
      />
      <div className="p-6">
        <div className="card">
          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Recurso</th>
                  <th>ID</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.action}</td>
                    <td>{a.resource || '—'}</td>
                    <td className="font-mono text-xs">{a.resourceId || '—'}</td>
                    <td className="text-[var(--muted)]">
                      {new Date(a.createdAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length === 0 && (
            <p className="text-center text-[var(--muted)] py-8">
              Nenhuma atividade registrada ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
