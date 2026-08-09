'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowLeft, Briefcase, ExternalLink, Loader2, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import Image from 'next/image';
import { ApplicationChatModal } from '@/components/features/chat/ApplicationChatModal';
import { toast } from 'sonner';

const STAGES = [
  { id: 'SOURCED', label: 'Captado' },
  { id: 'SCREENING', label: 'Revisión' },
  { id: 'INTERVIEW', label: 'Entrevistando' },
  { id: 'OFFER', label: 'Oferta' },
  { id: 'HIRED', label: 'Contratado' },
  { id: 'REJECTED', label: 'Rechazado' }
];

export default function KanbanBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const { isAuthenticated, role, _hasHydrated } = useAuthStore();
  const router = useRouter();
  
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movingAppId, setMovingAppId] = useState<string | null>(null);
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>('');

  const loadJob = async () => {
    try {
      const res = await fetchApi(`/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        const jobData = data.data || data;
        setJob(jobData);
        setApplications(jobData.applications || []);
      } else {
        router.push('/dashboard/jobs');
      }
    } catch (err) {
      console.error('Error fetching job', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || role !== 'RECRUITER') {
      router.push('/login');
      return;
    }
    loadJob();
  }, [_hasHydrated, isAuthenticated, role, router]);

  const moveCandidate = async (appId: string, newStage: string) => {
    try {
      setMovingAppId(appId);
      const res = await fetchApi(`/jobs/applications/${appId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage })
      });
      
      if (res.ok) {
        // Optimistic update
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, stage: newStage } : app));
        toast.success('Candidato movido de etapa');
      } else {
        toast.error('Error al mover al candidato.');
      }
    } catch (err) {
      toast.error('Error de conexión.');
    } finally {
      setMovingAppId(null);
    }
  };

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </main>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col px-4 py-8 max-w-[100vw]">
        <div className="container mx-auto">
          <Button variant="ghost" asChild className="mb-6 gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <Link href="/dashboard/jobs">
              <ArrowLeft className="w-4 h-4" /> Volver a Vacantes
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
              <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <p className="text-sm text-gray-500 line-clamp-1">{job.description || 'Pipeline de candidatos para esta posición'}</p>
            </div>
          </div>
        </div>

        {/* Tablero Kanban Scrollable */}
        <div className="flex-1 overflow-x-auto pb-8">
          <div className="flex gap-6 min-w-max px-4 h-full items-start">
            {STAGES.map((stage) => {
              const stageApps = applications.filter(app => app.stage === stage.id);
              
              return (
                <div key={stage.id} className="w-80 bg-gray-100 dark:bg-[#111] rounded-xl flex flex-col max-h-[70vh]">
                  <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">{stage.label}</h3>
                    <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
                      {stageApps.length}
                    </span>
                  </div>
                  
                  <div className="p-3 flex-1 overflow-y-auto space-y-3">
                    {stageApps.map(app => {
                      const profile = app.candidate || app.profile;
                      if (!profile) {
                         // Mostrar un fallback si no viene el candidato
                         return (
                           <Card key={app.id} className="bg-white dark:bg-[#161616] shadow-sm border-gray-200 dark:border-gray-800 p-4 text-xs text-red-500">
                             Candidato no encontrado (Error de datos)
                           </Card>
                         );
                      }
                      
                      const isAnonymized = profile.visibility === 'ANONYMIZED';
                      const displayName = isAnonymized ? 'Candidato Anónimo' : (profile.displayName || 'Sin Nombre');
                      
                      return (
                        <Card key={app.id} className="bg-white dark:bg-[#161616] shadow-sm border-gray-200 dark:border-gray-800 relative group">
                          {movingAppId === app.id && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              {profile.profilePhotoUrl && !isAnonymized ? (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                                  <Image src={profile.profilePhotoUrl} alt={displayName} fill className="object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                                  {isAnonymized ? '?' : displayName?.charAt(0) || 'A'}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{displayName}</h4>
                                <p className="text-xs text-gray-500 line-clamp-1">{profile.headline || 'Sin titular'}</p>
                              </div>
                            </div>
                            
                            {app.notes && (
                              <p className="text-[10px] text-gray-500 bg-gray-50 dark:bg-[#222] p-2 rounded mb-3 line-clamp-2">
                                📝 {app.notes}
                              </p>
                            )}

                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs border-gray-200 dark:border-gray-700">
                                <Link href={`/talento/${profile.slug}`} target="_blank">
                                  Ver Perfil
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shrink-0"
                                onClick={() => {
                                  setChatAppId(app.id);
                                  setChatTitle(`Chat con ${displayName}`);
                                }}
                                title="Abrir chat de postulación"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <select 
                                className="flex-1 h-8 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] rounded-md px-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) moveCandidate(app.id, e.target.value);
                                }}
                              >
                                <option value="" disabled>Mover a...</option>
                                {STAGES.map(s => (
                                  <option key={s.id} value={s.id} disabled={s.id === stage.id}>{s.label}</option>
                                ))}
                              </select>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {stageApps.length === 0 && (
                      <div className="text-center p-4 text-xs text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        Ningún candidato en esta etapa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {chatAppId && (
        <ApplicationChatModal 
          chatId={chatAppId} 
          chatType="application"
          isOpen={true} 
          onClose={() => setChatAppId(null)} 
          title={chatTitle}
        />
      )}
    </div>
  );
}
