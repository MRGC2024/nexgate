'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

export default function AdminAuditPage() {
  const [list, setList] = useState<{ id: string; action: string; resource?: string; resourceId?: string; createdAt: string }[]>([]);

  useEffect(() => {
    api<typeof list>('/audit?limit=50').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <DashboardHeader
        title="Auditoria"
        subtitle="Logs de auditoria do sistema"
        breadcrumbs={[{ label: 'Home', href: '/admin' }, { label: 'Admin', href: '/admin' }, { label: 'Auditoria' }]}
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
                  <td>{a.action}</td>
                  <td>{a.resource || '—'}</td>
                  <td className="font-mono text-xs">{a.resourceId || '—'}</td>
                  <td className="text-[var(--muted)]">{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
