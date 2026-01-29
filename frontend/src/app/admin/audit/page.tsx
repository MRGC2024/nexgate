'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminAuditPage() {
  const [list, setList] = useState<{ id: string; action: string; resource?: string; resourceId?: string; createdAt: string }[]>([]);

  useEffect(() => {
    api<typeof list>('/audit?limit=50').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Auditoria</h1>
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
  );
}
