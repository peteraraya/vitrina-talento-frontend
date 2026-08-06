'use client';

import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800 py-12 transition-colors duration-300 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">Vitrina Talento</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400 font-medium">
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Términos</Link>
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacidad</Link>
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Contacto</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Vitrina Talento. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
