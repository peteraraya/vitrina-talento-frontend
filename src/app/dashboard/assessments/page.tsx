'use client';

import { Navbar, Footer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui';
import { CheckCircle2, AlertCircle, Clock, Award } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
        <div className="mb-10">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-2 mb-4">
            &larr; Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Centro de Evaluación
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Valida tus conocimientos con nuestros tests técnicos. Las habilidades verificadas destacan en tu perfil con una insignia oficial que aumenta x3 tus oportunidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-900/5 bg-white dark:bg-[#111] overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verificado
              </span>
            </div>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 text-blue-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">React Framework</h3>
              <p className="text-sm text-gray-500 mb-4">Conceptos core, Hooks, Context, y optimización de rendimiento.</p>
              <div className="text-sm font-medium text-emerald-600">Puntaje: 92% (Top 5%)</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-900/5 bg-white dark:bg-[#111] overflow-hidden rounded-2xl">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 text-indigo-600">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">TypeScript Advanced</h3>
              <p className="text-sm text-gray-500 mb-4">Tipos genéricos, utilidades, inferencia y configuraciones estrictas.</p>
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
                Iniciar Test (15 min)
              </button>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-900/5 bg-white dark:bg-[#111] overflow-hidden rounded-2xl">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4 text-orange-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Node.js / Express</h3>
              <p className="text-sm text-gray-500 mb-4">Arquitectura, streams, event loop y middleware.</p>
              <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold transition-colors" disabled>
                Disponible Pronto
              </button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
