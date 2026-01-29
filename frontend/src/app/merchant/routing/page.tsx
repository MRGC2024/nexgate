'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Rule = {
  id: string;
  paymentMethod: string;
  amountMinCents?: number;
  amountMaxCents?: number;
  priority: number;
  isFallback: boolean;
  active: boolean;
  connectorDefinition?: { code: string; name: string };
};

export default function MerchantRoutingPage() {
  const [list, setList] = useState<Rule[]>([]);

  useEffect(() => {
    api<Rule[]>('/routing/my').then(setList).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Regras de roteamento</h1>
      <div className="card">
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Método</th>
                <th>Conector</th>
                <th>Faixa (cents)</th>
                <th>Prioridade</th>
                <th>Fallback</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>{r.paymentMethod}</td>
                  <td className="font-mono">{r.connectorDefinition?.code || '—'}</td>
                  <td>{r.amountMinCents ?? '—'} a {r.amountMaxCents ?? '—'}</td>
                  <td>{r.priority}</td>
                  <td>{r.isFallback ? 'Sim' : 'Não'}</td>
                  <td>{r.active ? 'Ativa' : 'Inativa'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
