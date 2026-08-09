'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowLeft, MessageSquare, Check, X, Clock, ExternalLink, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { ApplicationChatModal } from '@/components/features/chat/ApplicationChatModal';

export default function ProposalsPage() {
  const { isAuthenticated, role, accessToken, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // States for recruiter reply
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>('');

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProposals = async () => {
      try {
        const response = await fetchApi('/contacts/me');
        if (response.ok) {
          const data = await response.json();
          setProposals(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Error fetching proposals', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [_hasHydrated, isAuthenticated, router]);

  const handleStatusUpdate = async (id: string, newStatus: 'ACCEPTED' | 'DECLINED') => {
    if (!confirm(`¿Estás seguro de que deseas ${newStatus === 'ACCEPTED' ? 'aceptar' : 'rechazar'} esta propuesta?`)) return;
    
    try {
      setProcessingId(id);
      const response = await fetchApi(`/contacts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        toast.success(`Propuesta ${newStatus === 'ACCEPTED' ? 'aceptada' : 'rechazada'}`);
      } else {
        toast.error('Error al actualizar el estado de la propuesta');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setProcessingId(null);
    }
  };

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </main>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACCEPTED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3"/> Aceptada</span>;
      case 'DECLINED': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><X className="w-3 h-3"/> Rechazada</span>;
      default: return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Pendiente</span>;
    }
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
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Propuestas (Contactos)</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {role === 'RECRUITER' ? 'Historial de solicitudes de contacto directo a candidatos.' : 'Solicitudes directas de empresas interesadas en ti.'}
            </p>
          </div>
        </div>

        {proposals.length === 0 ? (
          <Card className="text-center py-16 bg-white dark:bg-[#161616] border-dashed">
            <CardContent>
              <div className="flex justify-center mb-4 mt-6">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bandeja Vacía</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {role === 'RECRUITER' ? 'Aún no has enviado propuestas de contacto a ningún candidato. Ve al buscador para empezar.' : 'Aún no has recibido solicitudes de contacto. Asegúrate de tener tu perfil al 100% para destacar.'}
              </p>
              {role === 'RECRUITER' && (
                <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Link href="/talento">Buscar Talentos</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal: any) => {
              const displayName = role === 'RECRUITER' ? (proposal.candidate?.displayName || 'Candidato') : (proposal.recruiter?.companyName || 'Empresa Confidencial');
              const subtitle = role === 'RECRUITER' ? 'Candidato Contactado' : 'Empresa Interesada';
              
              return (
                <Card key={proposal.id} className="bg-white dark:bg-[#161616] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 font-bold text-lg">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {displayName}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {subtitle} • {new Date(proposal.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0 sm:self-center">
                        <Button 
                          onClick={() => {
                            setChatAppId(proposal.id);
                            setChatTitle(`Chat de Contacto con ${displayName}`);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Abrir Chat
                        </Button>
                        
                        {role === 'CANDIDATE' && proposal.status === 'PENDING' && (
                          <div className="flex gap-2 w-full">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20 flex-1"
                              onClick={() => handleStatusUpdate(proposal.id, 'DECLINED')}
                              disabled={processingId === proposal.id}
                            >
                              {processingId === proposal.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <X className="w-3 h-3 mr-1" />} 
                              Rechazar
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                              onClick={() => handleStatusUpdate(proposal.id, 'ACCEPTED')}
                              disabled={processingId === proposal.id}
                            >
                              {processingId === proposal.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                              Aceptar
                            </Button>
                          </div>
                        )}
                        
                        {role === 'RECRUITER' && proposal.candidate?.slug && (
                           <Button asChild variant="outline" size="sm" className="w-full text-xs text-gray-600 border-gray-200">
                             <Link href={`/talento/${proposal.candidate.slug}`} target="_blank"><ExternalLink className="w-3 h-3 mr-2"/> Ver Perfil</Link>
                           </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {chatAppId && (
        <ApplicationChatModal 
          chatId={chatAppId} 
          chatType="contact"
          isOpen={true} 
          onClose={() => setChatAppId(null)} 
          title={chatTitle}
        />
      )}

      <Footer />
    </div>
  );
}
