'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, isAdminPanel, shouldUseMerchantPanel } from '@/lib/api';
import Sidebar, { SidebarTrigger } from '@/components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (shouldUseMerchantPanel()) router.replace('/merchant');
    else if (!isAdminPanel()) router.replace('/merchant');
  }, [router]);

  return (
    <div className="flex min-h-screen min-w-0">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 left-0 right-0 z-30 flex items-center gap-3 h-14 min-h-[56px] px-4 border-b border-[var(--border)] bg-[var(--sidebar)] safe-area-padding">
          <SidebarTrigger onClick={() => setSidebarOpen(true)} />
          <Link href="/admin" className="flex items-center gap-2 font-semibold min-w-0 truncate">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white text-sm font-bold">N</span>
            <span className="truncate">NEXGATE</span>
          </Link>
        </header>
        <main className="flex-1 min-w-0 w-full max-w-full p-4 sm:p-6 overflow-x-hidden overflow-y-auto pt-4 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
