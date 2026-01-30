'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, isAdminPanel, shouldUseMerchantPanel } from '@/lib/api';
import { Zap, Shield, CreditCard, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      if (shouldUseMerchantPanel()) router.replace('/merchant');
      else if (isAdminPanel()) router.replace('/admin');
      else router.replace('/merchant');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden max-w-[100vw]">
      {/* Header */}
      <header className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur safe-area-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 gap-2 min-w-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl shrink-0 min-h-[44px] items-center">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white text-sm font-bold shadow-lg shadow-[var(--accent)]/25">
              N
            </span>
            NEXGATE
          </Link>
          <nav className="flex items-center gap-1 sm:gap-6 shrink-0 min-h-[44px] items-center">
            <a href="#features" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition hidden sm:inline py-2">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition hidden md:inline py-2">
              Como funciona
            </a>
            <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition px-2 py-2.5 min-h-[44px] flex items-center touch-manipulation">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary text-sm px-3 sm:px-5 py-2.5 rounded-lg shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/30 transition whitespace-nowrap touch-manipulation">
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero com ilustração */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--accent)] font-semibold text-sm uppercase tracking-wider mb-4">
                Gateway de pagamentos para o Brasil
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
                Receba com <span className="text-[var(--accent)]">Pix</span>, boleto e cartão em uma única API
              </h1>
              <p className="text-lg text-[var(--muted)] mb-10 max-w-xl">
                Integre em minutos. Taxas transparentes. Liquidação rápida. Painel completo para você e sua equipe.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/cadastro"
                  className="btn-primary inline-flex items-center justify-center gap-2 text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/35 transition min-h-[44px] touch-manipulation"
                >
                  Começar agora
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl min-h-[44px] touch-manipulation"
                >
                  Já tenho conta
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Sem taxa de adesão
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Aprovação em até 48h
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Suporte dedicado
                </span>
              </div>
            </div>
            {/* Ilustração hero: dashboard/pagamentos */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-6 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-2 mb-6">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs text-[var(--muted)] ml-4">Painel NEXGATE</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Pix recebido', value: 'R$ 2.450,00', status: 'pago' },
                    { label: 'Boleto', value: 'R$ 890,00', status: 'pendente' },
                    { label: 'Cartão', value: 'R$ 1.120,00', status: 'pago' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--background)]/80">
                      <span className="text-sm">{t.label}</span>
                      <span className="font-semibold text-[var(--accent)]">{t.value}</span>
                      <span className={`text-xs px-2 py-1 rounded ${t.status === 'pago' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {t.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Saldo disponível</span>
                  <span className="font-bold text-lg">R$ 4.320,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Por que o NEXGATE?</h2>
        <p className="text-[var(--muted)] text-center max-w-2xl mx-auto mb-16">
          Tudo que você precisa para receber pagamentos com segurança e escala.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: 'Pix instantâneo', desc: 'Receba em segundos. Liquidação automática na sua conta.' },
            { icon: Shield, title: 'Segurança em primeiro lugar', desc: 'Conformidade e criptografia. Seus dados protegidos.' },
            { icon: CreditCard, title: 'Uma API, vários métodos', desc: 'Pix, boleto e cartão. Integre uma vez e ofereça tudo.' },
            { icon: BarChart3, title: 'Painel completo', desc: 'Vendas, saques, relatórios e webhooks em tempo real.' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card text-center hover:border-[var(--accent)]/50 transition">
                <div className="flex justify-center mb-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)]/20 text-[var(--accent)]">
                    <Icon className="h-7 w-7" />
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)]">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="border-t border-[var(--border)] bg-[var(--card)]/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Como funciona</h2>
          <p className="text-[var(--muted)] text-center max-w-2xl mx-auto mb-16">
            Em poucos passos você começa a receber pagamentos.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/20 text-[var(--accent)] font-bold text-2xl mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Crie sua conta</h3>
              <p className="text-sm text-[var(--muted)]">Cadastre sua empresa, envie os documentos e aguarde a aprovação.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/20 text-[var(--accent)] font-bold text-2xl mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">Integre a API</h3>
              <p className="text-sm text-[var(--muted)]">Use nossa documentação e chaves de API para conectar seu sistema.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/20 text-[var(--accent)] font-bold text-2xl mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Receba pagamentos</h3>
              <p className="text-sm text-[var(--muted)]">Pix, boleto e cartão. Acompanhe tudo no painel em tempo real.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para integrar?</h2>
          <p className="text-[var(--muted)] mb-10 max-w-xl mx-auto">
            Crie sua conta, envie os documentos e comece a receber pagamentos em poucos dias. Sem taxa de adesão.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-10 py-4 rounded-xl shadow-lg shadow-[var(--accent)]/25">
              Criar conta grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-10 py-4 rounded-xl">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white text-sm font-bold">N</span>
            <span className="font-semibold">NEXGATE</span>
          </div>
          <div className="flex gap-8 text-sm text-[var(--muted)]">
            <Link href="/login" className="hover:text-[var(--foreground)]">Entrar</Link>
            <Link href="/cadastro" className="hover:text-[var(--foreground)]">Criar conta</Link>
            <a href="#features" className="hover:text-[var(--foreground)]">Recursos</a>
          </div>
          <span className="text-sm text-[var(--muted)]">© NEXGATE. Gateway de pagamentos.</span>
        </div>
      </footer>
    </div>
  );
}
