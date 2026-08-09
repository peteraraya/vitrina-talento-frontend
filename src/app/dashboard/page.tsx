'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import { fetchApi } from '@/lib/api';
import { API_ROUTES } from '@/config/api.config';
import { Eye, Share2, TrendingUp, User, LogOut, ExternalLink, Settings, Loader2, Star, Search, FileText, Bookmark, Code, MessageSquare, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { isAuthenticated, logout, _hasHydrated, role, accessToken } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<{ totalThisWeek: number, byChannel: any[], searchAppearances?: number, profileViews?: number } | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [completenessData, setCompletenessData] = useState<{score: number, missingItems: any[]} | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCV = async () => {
    if (!accessToken) return;
    try {
      setIsDownloading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      const response = await fetch(`${baseUrl}/profiles/me/export-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Error al generar el PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mi-cv-profesional.pdf');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Ocurrió un problema al descargar el CV');
    } finally {
      setIsDownloading(false);
    }
  };

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
      }),
      fetchApi('/profiles/me/completeness').then(res => {
        if (!res.ok) throw new Error('Completeness not found');
        return res.json();
      }).then(data => {
        setCompletenessData(data);
      }).catch(err => {
        console.error('Error fetching completeness:', err);
        setCompletenessData({ score: 0, missingItems: [] });
      })
    ]).finally(() => {
      setIsLoadingData(false);
    });

  }, [isAuthenticated, router, _hasHydrated, role]);

  const completeness = completenessData?.score || 0;
  const missingItems = completenessData?.missingItems || [];

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

  const sharesCount = typeof stats?.totalThisWeek === 'number' ? stats.totalThisWeek : 0;
  const viewsCount = typeof stats?.profileViews === 'number' ? stats.profileViews : (profileData?.profileViews || 0);
  const searchCount = typeof stats?.searchAppearances === 'number' ? stats.searchAppearances : (profileData?.searchAppearances || 0);

  const firstName = profileData?.displayName?.split(' ')[0] || 'Talento';

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
              asChild
              className="gap-2 border-gray-300 dark:border-gray-700 rounded-xl"
            >
              <Link href={role === 'RECRUITER' ? '/profile' : (profileData?.slug ? `/talento/${profileData.slug}` : '/profile')}>
                <User className="h-4 w-4" />
                Mi Perfil
              </Link>
            </Button>
          </div>
        </div>
        
        {role === 'RECRUITER' ? (
          <div className="space-y-8">
            {/* Hero / Banner Moderno para Reclutador */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 md:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10">
                <svg width="400" height="400" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
                  <Star className="w-4 h-4 fill-blue-200" />
                  Plataforma de Adquisición de Talento
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Descubre hoy a tu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">gran talento</span>
                </h2>
                <p className="text-blue-100/80 text-lg mb-8 max-w-xl leading-relaxed">
                  Accede a perfiles verificados, filtra por habilidades técnicas y gestiona tus candidatos favoritos desde un solo lugar.
                </p>
                <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-gray-100 rounded-full px-8 h-12 font-semibold shadow-lg shadow-white/10 transition-all hover:scale-105">
                  <Link href="/talento" className="gap-2">
                    <Search className="w-5 h-5" /> Comenzar Búsqueda
                  </Link>
                </Button>
              </div>
            </div>

            {/* Grid de Accesos Rápidos y Métricas Visuales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <Card className="col-span-1 md:col-span-2 border border-gray-100 dark:border-gray-800 shadow-xl shadow-indigo-900/5 bg-white dark:bg-[#111] overflow-hidden rounded-2xl group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
                <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sistema ATS (Vacantes)</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 flex-1">
                      Crea puestos de trabajo, asigna candidatos desde el buscador y supervísalos a través de tu tablero Kanban (Sourced, Interview, Hired...).
                    </p>
                    <Button asChild variant="default" className="w-fit bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                      <Link href="/dashboard/jobs">Gestionar Vacantes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2 border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-900/5 bg-white dark:bg-[#111] overflow-hidden rounded-2xl group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Buscador Inteligente</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 flex-1">
                      Filtra candidatos por stack tecnológico, pretensión de renta, disponibilidad y modalidad de trabajo (Remoto/Presencial).
                    </p>
                    <Button asChild variant="outline" className="w-fit border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl">
                      <Link href="/talento">Ir al buscador general</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2 border border-gray-100 dark:border-gray-800 shadow-xl shadow-amber-900/5 bg-white dark:bg-[#111] rounded-2xl group hover:border-amber-200 dark:hover:border-amber-900/50 transition-all flex flex-col">
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mis Propuestas (Inbox)</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1">
                    Bandeja de mensajes de contacto ciego enviados y respuestas de candidatos.
                  </p>
                  
                  <Button asChild variant="outline" className="w-full border-gray-200 dark:border-gray-700 rounded-xl hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400">
                    <Link href="/dashboard/proposals">
                      Ver bandeja de mensajes
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2 border border-gray-100 dark:border-gray-800 shadow-xl shadow-emerald-900/5 bg-white dark:bg-[#111] rounded-2xl group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all flex flex-col">
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Bookmark className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mis Guardados</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1">
                    Gestiona tu cantera privada de perfiles que marcaste para contactar luego.
                  </p>
                  
                  <Button asChild variant="outline" className="w-full border-gray-200 dark:border-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400">
                    <Link href="/dashboard/saved-candidates">
                      Abrir favoritos
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero / Banner Moderno para Candidato */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-8 md:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10">
                <svg width="400" height="400" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  Tu centro de control profesional
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Hola <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{firstName}</span>, tu próximo gran salto comienza aquí
                </h2>
                <p className="text-blue-100/80 text-lg mb-8 max-w-xl leading-relaxed">
                  Mantén tu perfil al 100%, revisa tus métricas de visibilidad en tiempo real y comparte tu vitrina profesional para atraer a los mejores empleadores.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* MAIN CONTENT (Left Column) */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                
                {/* Profile Completeness Widget */}
                <Card className="border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-900/5 bg-white dark:bg-[#111] overflow-hidden rounded-2xl">
                  <CardContent className="p-0 flex flex-col">
                    <div className="p-8 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
                      <div className="relative h-20 w-20 shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-[#111] shadow-inner">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{completeness}%</span>
                        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
                          <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={`${completeness * 2.89} 289`} className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out drop-shadow-md" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Fuerza de tu perfil: {completeness === 100 ? '¡Estelar!' : 'Intermedia'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {completeness === 100 
                            ? 'Tienes un perfil sumamente atractivo. Estás en la mejor posición para recibir propuestas.'
                            : 'Completa las misiones faltantes para aumentar tu visibilidad.'}
                        </p>
                      </div>
                    </div>
                    {completeness < 100 && (
                      <div className="bg-gray-50 dark:bg-[#161616] p-6 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          🎯 Misiones pendientes
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                          {missingItems.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-white dark:bg-[#1A1A1A] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                              <span>
                                {item.message} <span className="font-semibold text-blue-600 dark:text-blue-400">(+{item.points}%)</span>
                              </span>
                            </div>
                          ))}
                        </div>
                        <Button variant="default" onClick={() => router.push('/profile')} className="w-full sm:w-auto self-start mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                          Completar mi perfil ahora
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Herramientas Principales */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tus herramientas</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <button 
                      onClick={() => router.push('/dashboard/applications')}
                      className="group relative overflow-hidden flex items-center p-5 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 text-left hover:-translate-y-1"
                    >
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Mis Postulaciones</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Procesos y chats activos.
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={() => router.push('/dashboard/proposals')}
                      className="group relative overflow-hidden flex items-center p-5 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-900/50 transition-all duration-300 text-left hover:-translate-y-1"
                    >
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Mis Propuestas</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Solicitudes de contacto directo.
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={() => router.push('/profile')}
                      className="group relative overflow-hidden flex items-center p-5 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 text-left hover:-translate-y-1"
                    >
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Editar Mi Perfil</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Actualiza tu experiencia.
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={downloadCV}
                      disabled={isDownloading}
                      className="group relative overflow-hidden flex items-center p-5 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300 text-left disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
                    >
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Descargar mi CV</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF profesional listo.
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={() => router.push('/dashboard/share-card')}
                      className="group relative overflow-hidden flex items-center p-5 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 text-left hover:-translate-y-1"
                    >
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <Share2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Compartir Tarjeta</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Para redes sociales.
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={() => router.push(profileData?.slug ? `/talento/${profileData.slug}` : '/profile')}
                      className="group relative overflow-hidden flex items-center p-5 bg-white dark:bg-[#161616] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all duration-300 text-left hover:-translate-y-1"
                    >
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <ExternalLink className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Ver Perfil Público</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cómo te ven las empresas.
                        </p>
                      </div>
                    </button>

                  </div>
                </div>

                {/* API para Developers (Movido abajo) */}
                <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] overflow-hidden rounded-2xl mt-6">
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="p-6 md:p-8 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-500" /> API para Developers
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Usa nuestro endpoint público para alimentar tu sitio web personal con tu información actualizada, sin crear un backend.
                      </p>
                      <div className="bg-[#0A0A0A] rounded-xl p-4 overflow-x-auto border border-gray-800">
                        <pre className="text-xs font-mono text-gray-300">
                          <code className="language-javascript">
<span className="text-pink-400">const</span> <span className="text-blue-300">fetchMyProfile</span> <span className="text-pink-400">=</span> <span className="text-pink-400">async</span> () <span className="text-pink-400">{'=>'}</span> &#123;{'\n'}
  <span className="text-pink-400">const</span> res <span className="text-pink-400">=</span> <span className="text-pink-400">await</span> <span className="text-blue-300">fetch</span>(<span className="text-green-300">'https://api.vitrinatuempleo.com/v1/profiles/{profileData?.slug || 'tu-slug'}'</span>);{'\n'}
  <span className="text-blue-300">console</span>.<span className="text-blue-300">log</span>(<span className="text-pink-400">await</span> res.<span className="text-blue-300">json</span>());{'\n'}
&#125;;
                          </code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* SIDEBAR (Right Column) */}
              <div className="col-span-1 space-y-6">
                
                {/* Stats Cards Apiladas */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tus Estadísticas</h2>
                
                <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] rounded-2xl">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vistas de Perfil</h3>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{viewsCount}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] rounded-2xl">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <SearchIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Apariciones Búsqueda</h3>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{searchCount}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] rounded-2xl">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarjetas Compartidas</h3>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{sharesCount}</div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
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
