import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import Image from 'next/image';
import { ArrowLeft, Mail, Bookmark, Phone, Link2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { BackButton } from './BackButton';
import { ProfileActions } from './ProfileActions';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const imageUrl = `${domain}/api/og?slug=${resolvedParams.slug}`;

  return {
    title: `Perfil Profesional | Vitrina tu Empleo`,
    description: `Revisa la disponibilidad de este profesional.`,
    openGraph: {
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      images: [imageUrl],
    },
  };
}

import { MapPin, Briefcase, Star, Search } from 'lucide-react';

export default async function PublicProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
  
  let profile;
  let similarProfiles: any[] = [];

  if (USE_MOCK_API) {
    profile = {
      displayName: 'Juan Pérez (Mock Público)',
      headline: 'Desarrollador Frontend Senior',
      summary: 'Perfil mock de prueba para recorrer toda la app sin backend.',
      skills: [{ skill: { name: 'React' } }, { skill: { name: 'Next.js' } }],
    };
  } else {
    // Normalizamos la URL base eliminando barras finales
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    // Try to fetch full profile data (for rendering the public page)
    const res = await fetch(`${baseUrl}/profiles/${resolvedParams.slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      return <div>Error al cargar el perfil.</div>;
    }

    profile = await res.json();

    // Fetch similar profiles
    try {
      const similarRes = await fetch(`${baseUrl}/profiles/${resolvedParams.slug}/similar`, {
        cache: 'no-store',
      });
      if (similarRes.ok) {
        similarProfiles = await similarRes.json();
      }
    } catch (e) {
      console.error('Error fetching similar profiles', e);
    }
  }

  const isAnonymized = profile.visibility === 'ANONYMIZED';
  const displayName = isAnonymized ? 'Candidato Anónimo' : profile.displayName;
  const profilePhotoUrl = isAnonymized ? null : profile.profilePhotoUrl;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <Navbar />
      <div className="container mx-auto p-4 md:p-8 max-w-3xl flex-1">
        
        {/* Barra superior de navegación / acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <BackButton />
          <ProfileActions 
            slug={resolvedParams.slug}
            isAnonymized={isAnonymized} 
            contactEmail={profile.contactEmail} 
            linkedinUrl={profile.linkedinUrl} 
          />
        </div>

        {isAnonymized && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
            <span className="text-xl">🔒</span>
            Este perfil está en <strong>Modo Anónimo</strong>. La identidad del candidato está protegida.
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border">
          <div className="flex items-center gap-6 mb-8">
            {profilePhotoUrl ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0">
                <Image src={profilePhotoUrl} alt="Avatar" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-2xl font-bold">
                {isAnonymized ? '?' : displayName?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">{profile.headline || 'Sin titular'}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Resumen</h2>
            <p className="text-gray-700 dark:text-gray-300">{profile.summary || 'No hay resumen disponible.'}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Habilidades Principales</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((s: any) => (
                <span key={s.skill.name || s.name || s} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  {s.skill.name || s.name || s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Profiles Section */}
        {similarProfiles && similarProfiles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Candidatos Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarProfiles.slice(0, 3).map((sim: any) => {
                const simAnonymized = sim.visibility === 'ANONYMIZED';
                const simName = simAnonymized ? 'Candidato Anónimo' : sim.displayName;
                const simAvatar = simAnonymized ? '?' : simName?.charAt(0) || 'A';
                
                // Extraer el modo de trabajo y salario para la vista simplificada
                const rawWorkMode = sim.availabilities?.[0]?.workMode || sim.workMode;
                const workMode = rawWorkMode === 'REMOTE' ? 'Remoto' : rawWorkMode === 'HYBRID' ? 'Híbrido' : 'Presencial';

                return (
                  <Link href={`/talento/${sim.slug}`} key={sim.slug}>
                    <div className="bg-white dark:bg-[#161616] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 transition-all h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        {sim.profilePhotoUrl && !simAnonymized ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                            <Image src={sim.profilePhotoUrl} alt={simName} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                            {simAvatar}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{simName}</h3>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium line-clamp-1">{sim.headline || 'Profesional'}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4 flex-1">
                        {sim.skills?.slice(0, 3).map((s: any) => (
                          <span key={s.skill?.name || s.name || s} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md text-[10px] border border-gray-100 dark:border-gray-700">
                            {s.skill?.name || s.name || s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {sim.location?.split(',')[0] || 'Remoto'}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {workMode}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
