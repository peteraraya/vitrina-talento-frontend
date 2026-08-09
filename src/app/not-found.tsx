import Link from 'next/link';
import { Button } from '@/components/ui';
import { FileQuestion, Search } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6 rotate-12">
            <FileQuestion className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Página no encontrada</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
            Parece que el enlace está roto o la página que buscas ya no existe.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full gap-2 shadow-blue-500/20 shadow-lg" size="lg">
              <Link href="/">
                <Search className="w-4 h-4" /> Explorar Talentos
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full" size="lg">
              <Link href="/dashboard">
                Ir a mi Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
