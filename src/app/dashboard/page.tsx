'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import { fetchApi } from '@/lib/api';
import { Eye, Share2, TrendingUp, User, LogOut, ExternalLink, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<{ totalThisWeek: number, byChannel: any[] } | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchApi('/profiles/me/share-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
      
    fetchApi('/profiles/me')
      .then(res => res.json())
      .then(data => setProfileData(data))
      .catch(console.error);
  }, [isAuthenticated, router]);

  // Cálculo de completitud de perfil mock
  const calculateCompleteness = () => {
    if (!profileData) return 0;
    let score = 0;
    if (profileData.displayName) score += 20;
    if (profileData.headline) score += 20;
    if (profileData.summary) score += 20;
    if (profileData.skills?.length || profileData.languages?.length) score += 20;
    if (profileData.linkedinUrl || profileData.githubUrl) score += 20;
    return score;
  };

  const completeness = calculateCompleteness();

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Tu Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Resumen de tu actividad y atajos rápidos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2 border-gray-300 dark:border-gray-700 rounded-xl"
              onClick={() => { logout(); router.push('/login'); }}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
        
        {/* Profile Completeness Widget */}
        <Card className="mb-10 border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 shadow-none">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative h-20 w-20 shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-[#111] border-4 border-blue-100 dark:border-blue-900">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{completeness}%</span>
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-blue-100 dark:text-blue-900" />
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={`${completeness * 2.89} 289`} className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Fuerza de tu perfil: {completeness === 100 ? '¡Estelar!' : 'Intermedia'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {completeness === 100 
                  ? 'Tienes un perfil sumamente atractivo para los reclutadores. ¡Sigue así!'
                  : 'Completa las secciones faltantes como enlaces sociales y un buen resumen para aumentar tu visibilidad.'}
              </p>
              {completeness < 100 && (
                <Button variant="outline" size="sm" onClick={() => router.push('/profile')} className="bg-white dark:bg-[#161616]">
                  Completar perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-0 shadow-md bg-white dark:bg-[#161616]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Vistas de Perfil
              </CardTitle>
              <Eye className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats ? stats.totalThisWeek : '0'}
              </div>
              <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="h-3 w-3" />
                +14% respecto a la semana pasada
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white dark:bg-[#161616]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Apariciones en Búsquedas
              </CardTitle>
              <SearchIcon className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats ? Math.floor(stats.totalThisWeek * 3.5) : '0'}
              </div>
              <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="h-3 w-3" />
                +5% respecto a la semana pasada
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white dark:bg-[#161616]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tarjetas Compartidas
              </CardTitle>
              <Share2 className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats ? Math.floor(stats.totalThisWeek * 0.4) : '0'}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Veces que los reclutadores te guardaron
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <button 
            onClick={() => router.push('/profile')}
            className="group flex flex-col items-start p-6 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all text-left"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Editar Mi Perfil</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Actualiza tus habilidades, resumen y experiencia para destacar más.
            </p>
          </button>

          <button 
            onClick={() => router.push('/dashboard/share-card')}
            className="group flex flex-col items-start p-6 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all text-left"
          >
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Compartir Tarjeta</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Genera tu tarjeta pública de presentación optimizada para redes sociales.
            </p>
          </button>

          <button 
            onClick={() => router.push('/talento/mock-slug')}
            className="group flex flex-col items-start p-6 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all text-left"
          >
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <ExternalLink className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ver Perfil Público</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mira exactamente cómo te ven los reclutadores.
            </p>
          </button>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// Icono faltante en los imports
function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
