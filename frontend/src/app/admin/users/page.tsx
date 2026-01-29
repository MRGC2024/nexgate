'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [list, setList] = useState<{ id: string; email: string; name: string; merchantId?: string; roles?: { name: string }[] }[]>([]);

  useEffect(() => {
    api<typeof list>('/users').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Usuários</h1>
      <div className="card">
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Merchant</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="font-mono text-xs">{u.merchantId || '—'}</td>
                  <td>{(u.roles || []).map((r) => r.name).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
