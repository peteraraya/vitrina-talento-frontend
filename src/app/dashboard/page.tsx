'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Bienvenido a Vitrina Talento!</p>
      <div className="flex gap-4">
        <Button onClick={() => router.push('/profile')} variant="outline">
          Mi Perfil
        </Button>
        <Button
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
