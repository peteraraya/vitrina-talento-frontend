'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import { ShieldCheck, ArrowRight, Search, Star, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#111111] dark:text-gray-200 transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-36 overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 dark:opacity-30 blur-[100px]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-[850px] mx-auto text-center space-y-8">
              <div className="inline-flex items-center rounded-full border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                <Star className="mr-1 h-4 w-4 fill-blue-600 dark:fill-blue-400" />
                La plataforma líder de reclutamiento
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                Conectamos el <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">talento ideal</span> con las mejores empresas
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Potencia tu carrera profesional con privacidad absoluta. Las empresas top ya están buscando candidatos como tú.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <Button asChild variant="default" size="xl" className="w-full sm:w-auto shadow-blue-600/20">
                  <Link href="/register">
                    Comenzar como Candidato
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
                  <Link href="/register">
                    Soy Empresa / Reclutador
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-[#F8FAFC] dark:bg-[#111111] border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Todo lo que necesitas para crecer</h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Herramientas diseñadas meticulosamente tanto para el talento como para reclutadores exigentes.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="flex flex-col p-8 rounded-3xl bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none transition-all duration-300">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-6">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Privacidad Total</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Controla exactamente quién ve tu perfil. Usa el modo anónimo para escuchar ofertas sin alertar a tu empresa actual.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col p-8 rounded-3xl bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none transition-all duration-300">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mb-6">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Perfiles Enriquecidos</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Añade idiomas, certificaciones, experiencia y expectativas salariales en un dashboard intuitivo y profesional.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col p-8 rounded-3xl bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none transition-all duration-300">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit mb-6">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Match Preciso</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nuestro algoritmo inteligente filtra y conecta las necesidades exactas de los reclutadores con tus habilidades únicas.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-700 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para dar el siguiente paso?</h2>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">Únete a miles de profesionales que ya han encontrado su trabajo soñado a través de nuestra plataforma.</p>
            <Button asChild variant="light" size="xl" className="px-10">
              <Link href="/register">
                Crear mi cuenta gratis
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
