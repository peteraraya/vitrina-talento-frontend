'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí puedes registrar el error en un servicio como Sentry
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl shadow-red-500/5 dark:shadow-none"
      >
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Ups! Algo salió mal</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Hemos encontrado un error inesperado. Nuestro equipo ya ha sido notificado.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" /> Intentar de nuevo
          </Button>
          <Button variant="outline" asChild className="w-full gap-2">
            <Link href="/">
              <Home className="w-4 h-4" /> Volver al inicio
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
