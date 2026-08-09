'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export function BackButton() {
  const router = useRouter();
  const { role, isAuthenticated, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <Button variant="ghost" disabled className="gap-2 text-gray-500">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Button>
    );
  }

  // Si es un candidato autenticado viendo un perfil (suponiendo el suyo), lo mandamos al dashboard
  if (isAuthenticated && role === 'CANDIDATE') {
    return (
      <Button variant="ghost" asChild className="gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
        <Link href="/dashboard">
          <ArrowLeft className="w-4 h-4" /> Volver al dashboard
        </Link>
      </Button>
    );
  }

  // Comportamiento por defecto (Reclutador o usuario anónimo)
  return (
    <Button variant="ghost" asChild className="gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
      <Link href="/talento">
        <ArrowLeft className="w-4 h-4" /> Volver al buscador
      </Link>
    </Button>
  );
}