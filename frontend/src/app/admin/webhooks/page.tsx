'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminWebhooksPage() {
  const [deliveries, setDeliveries] = useState<{ id: string; event: string; status: string; statusCode: number; createdAt: string }[]>([]);

  useEffect(() => {
    api<typeof deliveries>('/webhooks/deliveries').then(setDeliveries).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Webhooks (entregas)</h1>
      <div className="card">
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
