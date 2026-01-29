'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminConnectorsPage() {
  const [list, setList] = useState<{ id: string; code: string; name: string; enabled: boolean }[]>([]);

  useEffect(() => {
    api<typeof list>('/connectors/definitions').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Conectores</h1>
      <div className="card">
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="font-mono">{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.enabled ? 'Habilitado' : 'Desabilitado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
