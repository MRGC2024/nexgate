'use client';

import DashboardHeader from '@/components/DashboardHeader';
import { getApiBase } from '@/lib/api';

const baseUrl = typeof window !== 'undefined' ? getApiBase().replace('/api', '') : '';

export default function DocsPage() {
  return (
    <div>
      <DashboardHeader
        title="Documentação da API"
        subtitle="Integre com a API do NEXGATE, incluindo Pix"
        breadcrumbs={[{ label: 'Documentação' }]}
      />
      <div className="p-6 max-w-4xl space-y-8 text-sm">
        <section className="card">
          <h2 className="text-lg font-semibold mb-4 text-[var(--accent)]">Autenticação</h2>
          <p className="text-[var(--muted)] mb-2">
            Todas as requisições à API v1 devem enviar:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-[var(--muted)]">
            <li><strong className="text-[var(--foreground)]">X-API-Key:</strong> chave pública (ex.: pk_...)</li>
            <li><strong className="text-[var(--foreground)]">X-API-Secret:</strong> chave secreta (ex.: sk_...)</li>
          </ul>
          <p className="text-[var(--muted)] mt-2">
            A chave secreta é exibida apenas uma vez na criação da API Key no painel (Integrações). Guarde-a em variável de ambiente.
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold mb-4 text-[var(--accent)]">Base URL</h2>
          <p className="text-[var(--muted)] mb-2">Use a URL da sua API em produção:</p>
          <code className="block p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs break-all">
            {baseUrl || 'https://sua-api.up.railway.app'}/api/v1
          </code>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold mb-4 text-[var(--accent)]">Integração Pix – Criar transação</h2>
          <p className="text-[var(--muted)] mb-4">
            <strong className="text-[var(--foreground)]">POST</strong> /v1/transactions
          </p>
          <pre className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)] overflow-x-auto text-xs">
{`{
  "amount_cents": 10000,
  "currency": "BRL",
  "payment_method": "pix",
  "external_ref": "pedido-123",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678909"
  },
  "items": [
    { "description": "Item 1", "quantity": 1, "amount_cents": 10000 }
  ],
  "metadata": { "order_id": "123" }
}`}
          </pre>
          <p className="text-[var(--muted)] mt-4">Resposta (201) inclui <code className="text-xs bg-[var(--background)] px-1 rounded">pix_qr</code>, <code className="text-xs bg-[var(--background)] px-1 rounded">pix_copy_paste</code> e <code className="text-xs bg-[var(--background)] px-1 rounded">expires_at</code>.</p>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold mb-4 text-[var(--accent)]">Endpoints principais (Pix)</h2>
          <ul className="space-y-2 text-[var(--muted)]">
            <li><strong className="text-[var(--foreground)]">GET</strong> /v1/transactions/:id – Consultar transação</li>
            <li><strong className="text-[var(--foreground)]">POST</strong> /v1/transactions/:id/cancel – Cancelar</li>
            <li><strong className="text-[var(--foreground)]">POST</strong> /v1/transactions/:id/refund – Estornar (body opcional: amount_cents para parcial)</li>
            <li><strong className="text-[var(--foreground)]">GET</strong> /v1/transactions?status=paid&payment_method=pix&limit=50 – Listar</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold mb-4 text-[var(--accent)]">Idempotência</h2>
          <p className="text-[var(--muted)]">
            Para POST /v1/transactions, envie o header <strong className="text-[var(--foreground)]">Idempotency-Key</strong> (string única por cobrança, ex.: UUID). Se repetir a requisição com a mesma chave, o gateway retorna a mesma transação.
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold mb-4 text-[var(--accent)]">Webhooks</h2>
          <p className="text-[var(--muted)] mb-2">
            Cadastre a URL no painel (Webhooks). O gateway envia POST com os headers X-Event-Id, X-Timestamp, X-Signature (HMAC-SHA256 de timestamp + &quot;.&quot; + body). Responda com 2xx em até 30s.
          </p>
          <p className="text-[var(--muted)]">
            Eventos: <code className="text-xs bg-[var(--background)] px-1 rounded">transaction.paid</code>, <code className="text-xs bg-[var(--background)] px-1 rounded">transaction.canceled</code>, etc.
          </p>
        </section>
      </div>
    </div>
  );
}
