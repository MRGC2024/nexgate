'use client';

import { useEffect, useState } from 'react';
import { api, getUser } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import { FileText, Upload, CheckCircle } from 'lucide-react';

const DOC_TYPES: { id: string; label: string; description: string }[] = [
  { id: 'doc_frente', label: 'Documento (frente)', description: 'RG ou CNH – lado da foto' },
  { id: 'doc_verso', label: 'Documento (verso)', description: 'RG – lado oposto' },
  { id: 'selfie_documento', label: 'Selfie com documento', description: 'Sua foto segurando o documento' },
  { id: 'comprovante_mei', label: 'Certificado MEI', description: 'Comprovante de MEI (se for MEI)' },
  { id: 'contrato_social', label: 'Contrato social', description: 'Contrato social da empresa (se for CNPJ)' },
  { id: 'comprovante_conta', label: 'Comprovante de conta', description: 'Comprovante bancário ou dados da conta' },
];

type Doc = { id: string; documentType: string; fileUrl: string; createdAt: string };

export default function MerchantDocumentosPage() {
  const user = getUser();
  const merchantId = user?.merchantId;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) return;
    api<Doc[]>(`/merchants/${merchantId}/documents`)
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [merchantId]);

  async function handleFile(type: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !merchantId) return;
    setUploading(type);
    setMessage(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await api(`/merchants/${merchantId}/documents`, {
          method: 'POST',
          body: JSON.stringify({ documentType: type, fileUrl: dataUrl }),
        });
        setDocs((prev) => [...prev, { id: '', documentType: type, fileUrl: dataUrl, createdAt: new Date().toISOString() }]);
        setMessage(`Documento "${DOC_TYPES.find((d) => d.id === type)?.label}" enviado.`);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao enviar.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  }

  const hasDoc = (type: string) => docs.some((d) => d.documentType === type);

  if (!merchantId) {
    return (
      <div>
        <DashboardHeader title="Documentos" breadcrumbs={[{ label: 'Merchant', href: '/merchant' }]} />
        <div className="p-6">Acesso negado.</div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Enviar documentos"
        subtitle="Envie os documentos necessários para aprovação da sua conta"
        breadcrumbs={[
          { label: 'Home', href: '/merchant' },
          { label: 'Merchant', href: '/merchant' },
          { label: 'Documentos' },
        ]}
      />
      <div className="p-4 sm:p-6 max-w-2xl space-y-6">
        {message && (
          <p className={message.includes('Erro') ? 'text-sm text-red-500' : 'text-sm text-green-500'}>{message}</p>
        )}
        <p className="text-sm text-[var(--muted)]">
          Após o cadastro, envie os documentos abaixo. Eles serão analisados e sua conta será aprovada em até 48h úteis.
        </p>
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : (
          <div className="space-y-4">
            {DOC_TYPES.map((doc) => (
              <div key={doc.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[var(--accent)] shrink-0" />
                    <h3 className="font-medium">{doc.label}</h3>
                    {hasDoc(doc.id) && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">{doc.description}</p>
                </div>
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 shrink-0">
                  <Upload className="h-4 w-4" />
                  {uploading === doc.id ? 'Enviando...' : hasDoc(doc.id) ? 'Substituir' : 'Enviar'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    disabled={uploading !== null}
                    onChange={(e) => handleFile(doc.id, e)}
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
