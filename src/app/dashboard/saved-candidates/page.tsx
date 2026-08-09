'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowLeft, Star, ExternalLink, Trash2, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SavedCandidatesPage() {
  const { isAuthenticated, role, accessToken, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated || role !== 'RECRUITER') {
      router.push('/login');
      return;
    }

    const fetchSaved = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        
        const response = await fetch(`${baseUrl}/profiles/me/saved-candidates`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCandidates(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Error fetching saved candidates', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaved();
  }, [_hasHydrated, isAuthenticated, role, accessToken, router]);

  const removeCandidate = async (slug: string) => {
    if (!confirm('¿Estás seguro de quitar a este candidato de tus favoritos?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      const response = await fetch(`${baseUrl}/profiles/saved-candidates/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        setCandidates(prev => prev.filter(c => (c.slug !== slug && c.profile?.slug !== slug)));
      } else {
        throw new Error('Failed to remove');
      }
    } catch (err) {
      alert('Error al quitar de favoritos.');
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
        <Button variant="ghost" asChild className="mb-6 gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
            <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Candidatos Guardados</h1>
            <p className="text-gray-600 dark:text-gray-400">Revisa y gestiona los talentos que marcaste como favoritos.</p>
          </div>
        </div>

        {candidates.length === 0 ? (
          <Card className="text-center py-16 bg-white dark:bg-[#161616] border-dashed">
            <CardContent>
              <div className="flex justify-center mb-4">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aún no tienes candidatos guardados</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Explora el buscador de talentos y utiliza el botón "Guardar" para agregar candidatos a esta lista y tenerlos a mano.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/talento">Ir al buscador de talentos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates.map((item, idx) => {
              // Manejo defensivo por si el endpoint retorna los perfiles directamente o envueltos en un objeto relacional
              const profile = item.profile || item;
              const slug = profile.slug;
              const displayName = profile.visibility === 'ANONYMIZED' ? 'Candidato Anónimo' : profile.displayName;

              return (
                <Card key={slug || idx} className="bg-white dark:bg-[#161616] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {displayName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-1">
                          {profile.headline || 'Sin titular'}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 -mt-2 -mr-2"
                        onClick={() => removeCandidate(slug)}
                        title="Quitar de favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {profile.skills?.slice(0, 3).map((s: any) => (
                        <span key={s.skill?.name || s.name || s} className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                          {s.skill?.name || s.name || s}
                        </span>
                      ))}
                      {profile.skills?.length > 3 && (
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-xs">
                          +{profile.skills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1 gap-2 border-gray-300 dark:border-gray-700">
                        <Link href={`/talento/${slug}`}>
                          <ExternalLink className="w-4 h-4" /> Ver perfil
                        </Link>
                      </Button>
                      {(!profile.isAnonymized && profile.contactEmail) && (
                        <Button asChild className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                          <a href={`mailto:${profile.contactEmail}`}>
                            <Mail className="w-4 h-4" /> Contactar
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}