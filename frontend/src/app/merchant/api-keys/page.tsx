'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Key = { id: string; publicKey: string; name?: string; active: boolean; createdAt: string };

export default function MerchantApiKeysPage() {
  const [list, setList] = useState<Key[]>([]);

  useEffect(() => {
    api<Key[]>('/api-keys').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">API Keys</h1>
      <div className="card">
        <p className="text-sm text-[var(--muted)] mb-4">
          Use X-API-Key e X-API-Secret nas requisições à API v1. A chave secreta é exibida apenas na criação.
        </p>
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Public Key</th>
                <th>Nome</th>
                <th>Status</th>
                <th>Criada em</th>
              </tr>
            </thead>
            <tbody>
              {list.map((k) => (
                <tr key={k.id}>
                  <td className="font-mono text-xs break-all">{k.publicKey}</td>
                  <td>{k.name || '—'}</td>
                  <td>{k.active ? 'Ativa' : 'Revogada'}</td>
                  <td className="text-[var(--muted)]">{new Date(k.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
