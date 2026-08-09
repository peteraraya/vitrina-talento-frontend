'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { ArrowLeft, Briefcase, MessageCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { ApplicationChatModal } from '@/components/features/chat/ApplicationChatModal';

export default function CandidateApplicationsPage() {
  const { isAuthenticated, role, _hasHydrated } = useAuthStore();
  const router = useRouter();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>('');

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (role !== 'CANDIDATE') {
      router.push('/dashboard');
      return;
    }

    const loadApplications = async () => {
      try {
        const res = await fetchApi('/jobs/applications/me');
        if (res.ok) {
          const data = await res.json();
          setApplications(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Error fetching applications', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [_hasHydrated, isAuthenticated, role, router]);

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

  const getStageLabel = (stage: string) => {
    const stages: Record<string, string> = {
      'SOURCED': 'Captado',
      'SCREENING': 'Revisión',
      'INTERVIEW': 'Entrevistando',
      'OFFER': 'Oferta',
      'HIRED': 'Contratado',
      'REJECTED': 'Rechazado'
    };
    return stages[stage] || stage;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6 gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Postulaciones</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Seguimiento de los procesos de selección en los que participas.
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card className="text-center py-16 bg-white dark:bg-[#161616] border-dashed">
            <CardContent>
              <div className="flex justify-center mb-4 mt-6">
                <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sin Postulaciones</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Aún no has sido incluido en ningún proceso de selección. Mantén tu perfil actualizado para destacar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="bg-white dark:bg-[#161616] shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {app.job?.title || 'Vacante confidencial'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {app.job?.companyName || app.job?.recruiter?.companyName || 'Empresa Confidencial'}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Estado: {getStageLabel(app.stage)}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setChatAppId(app.id);
                        setChatTitle(app.job?.title || 'Vacante');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 sm:self-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Abrir Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

      <Footer />
    </div>
  );
}
