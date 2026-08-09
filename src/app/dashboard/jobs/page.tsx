'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui';
import { ArrowLeft, Briefcase, Plus, Users, Clock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function JobsPage() {
  const { isAuthenticated, role, accessToken, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi('/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      console.error('Error fetching jobs', err);
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
    loadJobs();
  }, [_hasHydrated, isAuthenticated, role, router]);

  const handleCreateJob = async () => {
    if (!newJobTitle.trim()) {
      alert('Debes ingresar un título para la vacante.');
      return;
    }
    
    try {
      setIsCreating(true);
      const res = await fetchApi('/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: newJobTitle, description: newJobDesc })
      });
      
      if (res.ok) {
        setNewJobTitle('');
        setNewJobDesc('');
        setShowNewJobForm(false);
        loadJobs();
      } else {
        alert('Error al crear la vacante.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al crear vacante.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
              <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Vacantes (ATS)</h1>
              <p className="text-gray-600 dark:text-gray-400">Gestiona tus procesos de selección y el pipeline de candidatos.</p>
            </div>
          </div>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            onClick={() => setShowNewJobForm(!showNewJobForm)}
          >
            <Plus className="w-4 h-4" /> Crear Vacante
          </Button>
        </div>

        {showNewJobForm && (
          <Card className="mb-8 border-indigo-100 dark:border-indigo-900 shadow-md">
            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20 rounded-t-xl pb-4">
              <CardTitle className="text-lg">Nueva Vacante</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Título del puesto</label>
                <Input 
                  placeholder="Ej: Senior React Developer" 
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Descripción (Opcional)</label>
                <textarea 
                  className="w-full p-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm resize-none"
                  placeholder="Breve descripción de lo que buscas..."
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  disabled={isCreating}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowNewJobForm(false)} disabled={isCreating}>Cancelar</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreateJob} disabled={isCreating || !newJobTitle.trim()}>
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Guardar Puesto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {jobs.length === 0 && !showNewJobForm ? (
          <Card className="text-center py-16 bg-white dark:bg-[#161616] border-dashed">
            <CardContent>
              <div className="flex justify-center mb-4">
                <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tienes vacantes activas</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Crea una vacante para comenzar a guardar candidatos desde el buscador y gestionar tu embudo de contratación (Pipeline).
              </p>
              <Button onClick={() => setShowNewJobForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                <Plus className="w-4 h-4" /> Crear mi primera vacante
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-[#161616] shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col h-full group">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">{job.title}</h3>
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md whitespace-nowrap">
                      Abierta
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1">
                    {job.description || 'Sin descripción detallada.'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <strong>{job._count?.applications || job.applications?.length || 0}</strong> candidatos
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <Button asChild className="w-full bg-gray-50 hover:bg-indigo-50 text-indigo-700 dark:bg-[#222] dark:hover:bg-indigo-900/30 dark:text-indigo-400 border-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Link href={`/dashboard/jobs/${job.id}`}>
                      Ver Tablero Kanban <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}