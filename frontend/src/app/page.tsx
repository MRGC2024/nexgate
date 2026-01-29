'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/api';
import { isSuperadmin } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (isSuperadmin()) router.replace('/admin');
    else router.replace('/merchant');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--muted)]">Redirecionando...</p>
    </div>
  );
}
