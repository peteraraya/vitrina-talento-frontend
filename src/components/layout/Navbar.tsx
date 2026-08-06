'use client';

import Link from 'next/link';
import { Briefcase, UserCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Vitrina Talento</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Características</Link>
          <Link href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cómo funciona</Link>
          <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
        </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Ingresar
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/register">
                <UserCircle className="h-4 w-4" />
                Registro
              </Link>
            </Button>
          </div>
      </div>
    </header>
  );
}
