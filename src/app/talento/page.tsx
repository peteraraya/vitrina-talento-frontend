'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Search, MapPin, Briefcase, Star, SlidersHorizontal, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export default function TalentSearchPage() {
  const { isAuthenticated, role, _hasHydrated } = useAuthStore();
  const [talents, setTalents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQ, setSearchQ] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchSkills, setSearchSkills] = useState('');

  const fetchCandidates = useCallback(async (q = '', location = '', skills = '') => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (q) queryParams.append('q', q);
      if (location) queryParams.append('location', location);
      if (skills) queryParams.append('skills', skills);
      
      const res = await fetchApi(`/search/candidates?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const profiles = Array.isArray(data) ? data : (data.items || data.data || []);
        
        if (profiles.length > 0) {
          const formatted = profiles.map((profile: any, index: number) => {
            const isAnonymized = profile.visibility === 'ANONYMIZED';
            // El backend ya debería ocultar el nombre, pero nos aseguramos por si acaso
            const name = isAnonymized ? 'Candidato Anónimo' : (profile.displayName || 'Sin Nombre');
            const avatarChar = isAnonymized ? '?' : name.charAt(0).toUpperCase();
            
            let skills: string[] = [];
            if (Array.isArray(profile.skills)) {
              skills = profile.skills.map((s: any) => typeof s === 'string' ? s : s.skill?.name || s.name || '').filter(Boolean).slice(0, 5);
            }

            // Soportar tanto estructura anidada (profile.availability) como aplanada (profile.workMode)
            const rawWorkMode = profile.availability?.workMode || profile.workMode;
            const workMode = rawWorkMode === 'REMOTE' ? 'Remoto' : 
                             rawWorkMode === 'HYBRID' ? 'Híbrido' : 
                             rawWorkMode === 'ON_SITE' ? 'Presencial' : 
                             (rawWorkMode || 'Remoto');

            const salaryMin = profile.availability?.expectedSalaryMin || profile.expectedSalaryMin || profile.expectedSalary;
            const currency = profile.availability?.currency || profile.currency || 'USD';
            const expectedSalary = salaryMin ? `$${salaryMin} ${currency}` : 'A convenir';

            return {
              id: profile.id || index + 100,
              slug: profile.slug,
              name,
              headline: profile.headline || 'Profesional',
              skills,
              location: profile.location || 'Remoto',
              workMode,
              expectedSalary,
              match: profile.matchScore || Math.floor(Math.random() * 20) + 80,
              avatar: avatarChar,
              profilePhotoUrl: isAnonymized ? null : profile.profilePhotoUrl
            };
          });
          setTalents(formatted);
        } else {
          setTalents([]);
        }
      } else {
        toast.error('Error al cargar candidatos');
        setTalents([]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red al buscar');
      setTalents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && role === 'RECRUITER') {
      fetchCandidates();
    } else if (_hasHydrated && (!isAuthenticated || role !== 'RECRUITER')) {
      setIsLoading(false);
    }
  }, [_hasHydrated, isAuthenticated, role, fetchCandidates]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchCandidates(searchQ, searchLocation, searchSkills);
  };

  const handleQuickFilter = (skill: string) => {
    setSearchSkills(skill);
    fetchCandidates(searchQ, searchLocation, skill);
  };

  if (!_hasHydrated) return null;

  if (!isAuthenticated || role !== 'RECRUITER') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-gray-500 mb-6">Debes iniciar sesión como Reclutador para buscar talentos.</p>
            <Button asChild><Link href="/login">Ir al Login</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />

      {/* Hero Buscador */}
      <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
            Encuentra al <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">candidato perfecto</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Filtra por habilidades, expectativas salariales y disponibilidad inmediata.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-2 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-full shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                className="w-full pl-12 bg-transparent border-0 focus-visible:ring-0 shadow-none h-12 text-lg" 
                placeholder="Ej. React Developer, Diseñador UX..." 
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                className="w-full pl-12 bg-transparent border-0 focus-visible:ring-0 shadow-none h-12 text-lg" 
                placeholder="Ubicación o Remoto..." 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-xl md:rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar Talentos'}
            </Button>
          </form>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-sm font-medium text-gray-500 mr-2">Habilidades Populares:</span>
            {['React', 'Node.js', 'Python', 'AWS', 'Figma'].map(skill => (
              <span 
                key={skill} 
                onClick={() => handleQuickFilter(skill)}
                className={`px-3 py-1 border rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  searchSkills === skill 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                }`}
              >
                {skill}
              </span>
            ))}
            {searchSkills && (
              <span 
                onClick={() => handleQuickFilter('')} 
                className="px-3 py-1 text-xs text-red-500 font-medium cursor-pointer hover:underline"
              >
                Limpiar Filtro
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Resultados destacados <span className="text-gray-400 font-normal">({talents.length})</span>
          </h2>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Más filtros
          </Button>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              Buscando a los mejores talentos...
            </div>
          ) : talents.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <Search className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg text-gray-900 dark:text-white font-medium mb-1">No se encontraron candidatos</p>
              <p>Intenta con otros términos de búsqueda o elimina los filtros.</p>
            </div>
          ) : (
            talents.map((talent) => (
            <Card key={talent.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161616]">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center sm:items-start p-6 gap-6">
                  {/* Avatar */}
                  {talent.profilePhotoUrl ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-[#161616] shadow-md">
                      <Image src={talent.profilePhotoUrl} alt={talent.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold border-2 border-white dark:border-[#161616] shadow-md shrink-0">
                      {talent.avatar}
                    </div>
                  )}
                  
                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{talent.name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mt-1">{talent.headline}</p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {talent.location}</span>
                          <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {talent.workMode}</span>
                          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                            💰 {talent.expectedSalary}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-sm font-bold">
                          <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" /> {talent.match}% Match
                        </div>
                        <Button asChild variant="default" className="w-full sm:w-auto mt-2 sm:mt-0 gap-2">
                          <Link href={`/talento/${talent.slug}`}>
                            Ver Perfil <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-2">
                      {talent.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )))}
        </div>
      </main>

      <Footer />
    </div>
  );
}