'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Endpoint = { id: string; url: string; events: string[]; active: boolean };
type Delivery = { id: string; event: string; status: string; statusCode: number; createdAt: string };

export default function MerchantWebhooksPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    api<Endpoint[]>('/webhooks').then(setEndpoints).catch(() => {});
    api<Delivery[]>('/webhooks/deliveries').then(setDeliveries).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Webhooks</h1>
      <div className="card mb-6">
        <h2 className="text-lg font-medium mb-4">Endpoints</h2>
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>URL</th>
                <th>Eventos</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={e.id}>
                  <td className="font-mono text-xs break-all">{e.url}</td>
                  <td>{(e.events || []).join(', ')}</td>
                  <td>{e.active ? 'Ativo' : 'Inativo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-medium mb-4">Entregas</h2>
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Status</th>
                <th>HTTP</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td>{d.event}</td>
                  <td>{d.status}</td>
                  <td>{d.statusCode}</td>
                  <td className="text-[var(--muted)]">{new Date(d.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
