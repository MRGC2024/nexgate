'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Mc = { id: string; connectorDefinition?: { code: string; name: string }; active: boolean };

export default function MerchantConnectorsPage() {
  const [list, setList] = useState<Mc[]>([]);

  useEffect(() => {
    api<Mc[]>('/connectors/my').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Conectores</h1>
      <div className="card">
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Conector</th>
                <th>Código</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td>{m.connectorDefinition?.name || '—'}</td>
                  <td className="font-mono">{m.connectorDefinition?.code || '—'}</td>
                  <td>{m.active ? 'Ativo' : 'Inativo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
