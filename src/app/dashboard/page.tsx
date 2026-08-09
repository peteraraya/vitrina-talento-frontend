'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import { fetchApi } from '@/lib/api';
import { API_ROUTES } from '@/config/api.config';
import { Eye, Share2, TrendingUp, User, LogOut, ExternalLink, Settings, Loader2, Star, Search } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { isAuthenticated, logout, _hasHydrated, role } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<{ totalThisWeek: number, byChannel: any[] } | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (role === 'RECRUITER') {
      setIsLoadingData(false);
      return;
    }

    Promise.all([
      fetchApi(API_ROUTES.STATS.SHARE).then(res => {
        if (!res.ok) throw new Error('Stats not found');
        return res.json();
      }).then(data => {
        // Soporte por si el backend envuelve la respuesta en { data: ... }
        const statsPayload = data.data ? data.data : data;
        setStats(statsPayload);
      }).catch(err => {
        console.error('Error fetching stats:', err);
        setStats(null);
      }),
      fetchApi(API_ROUTES.PROFILE.ME).then(res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      }).then(data => {
        const profilePayload = data.data ? data.data : data;
        setProfileData(profilePayload);
      }).catch(err => {
        console.error('Error fetching profile:', err);
        setProfileData(null);
      })
    ]).finally(() => {
      setIsLoadingData(false);
    });

  }, [isAuthenticated, router, _hasHydrated, role]);

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

  if (!_hasHydrated || !isAuthenticated || isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-6xl space-y-10">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  const totalThisWeek = typeof stats?.totalThisWeek === 'number' ? stats.totalThisWeek : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-6xl animate-in fade-in duration-500">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Tu Dashboard {role === 'RECRUITER' ? 'de Reclutador' : ''}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {role === 'RECRUITER' 
                ? 'Encuentra al candidato ideal de forma rápida y sencilla.'
                : 'Resumen de tu actividad y atajos rápidos.'}
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
        
        {role === 'RECRUITER' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <Card className="border-0 shadow-md bg-white dark:bg-[#161616] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Buscar Talentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Explora nuestra base de datos de profesionales filtrando por tecnologías, modalidad y expectativas salariales.
                  </p>
                  <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/talento">
                      Ir al buscador
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white dark:bg-[#161616] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Talentos Guardados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Revisa los perfiles que has marcado como favoritos para tus procesos de selección abiertos.
                  </p>
                  <Button variant="outline" size="lg" className="w-full" disabled>
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
        {/* Profile Completeness Widget with Missions */}
        <Card className="mb-10 border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 shadow-none overflow-hidden">
          <CardContent className="p-0 flex flex-col lg:flex-row">
            <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
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
                    ? 'Tienes un perfil sumamente atractivo para los reclutadores. Recibirás 3x más ofertas.'
                    : 'Completa las misiones faltantes para aumentar tu visibilidad radicalmente y destacar del resto.'}
                </p>
                {completeness === 100 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 rounded-full text-xs font-semibold">
                    <Star className="w-3 h-3 fill-amber-500" /> Perfil Destacado
                  </div>
                )}
              </div>
            </div>
            {completeness < 100 && (
              <div className="bg-blue-100/50 dark:bg-blue-900/20 p-6 lg:w-72 border-t lg:border-t-0 lg:border-l border-blue-100 dark:border-blue-900/50">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  🎯 Misiones pendientes
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {!profileData?.profilePhotoUrl && (
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                      Sube una foto de perfil (+20%)
                    </li>
                  )}
                  {!profileData?.summary && (
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                      Redacta tu resumen bio (+20%)
                    </li>
                  )}
                  {(!profileData?.skills?.length && !profileData?.languages?.length) && (
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                      Añade habilidades clave (+20%)
                    </li>
                  )}
                  {(!profileData?.linkedinUrl && !profileData?.githubUrl) && (
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                      Conecta tus redes/enlaces (+20%)
                    </li>
                  )}
                </ul>
                <Button variant="default" size="sm" onClick={() => router.push('/profile')} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  Completar perfil ahora
                </Button>
              </div>
            )}
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
                {totalThisWeek}
              </div>
              <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="h-3 w-3" />
                +14% respecto a la semana pasada
              </p>
              <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
                Reclutadores buscando <strong>{profileData?.headline?.split(' ')[0] || 'tu perfil'}</strong> vieron tu vitrina.
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
                {Math.floor(totalThisWeek * 3.5)}
              </div>
              <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="h-3 w-3" />
                +5% respecto a la semana pasada
              </p>
              <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
                Apareciste en el top 10% de resultados para <strong>{profileData?.skills?.[0]?.skill?.name || profileData?.skills?.[0] || 'tu área'}</strong>.
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
                {Math.floor(totalThisWeek * 0.4)}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Veces que los reclutadores te guardaron
              </p>
              <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
                Tu perfil ha sido enviado a {Math.floor(totalThisWeek * 0.2) || 1} empresas distintas esta semana.
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
            onClick={() => router.push(profileData?.slug ? `/talento/${profileData.slug}` : '/profile')}
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
        </>
        )}
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
