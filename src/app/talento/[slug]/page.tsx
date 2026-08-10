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
      skills: [
        { skill: { name: 'React' }, verified: true }, 
        { skill: { name: 'Next.js' } },
        { skill: { name: 'TypeScript' }, verified: true }
      ],
      experiences: [
        {
          company: 'Tech Corp',
          position: 'Senior Frontend Developer',
          startDate: 'Ene 2021',
          endDate: '',
          current: true,
          description: 'Liderazgo del equipo frontend, optimización de rendimiento y migración a Next.js.',
        },
        {
          company: 'Agencia Digital',
          position: 'Web Developer',
          startDate: 'Mar 2018',
          endDate: 'Dic 2020',
          current: false,
          description: 'Desarrollo de sitios web corporativos y e-commerce usando React y TailwindCSS.',
        }
      ],
      educations: [
        {
          institution: 'Universidad de Chile',
          degree: 'Ingeniería en Computación',
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
        }
      ],
      languages: [
        { name: 'Inglés', level: 'Avanzado' },
        { name: 'Español', level: 'Nativo' }
      ],
      portfolioItems: [
        {
          title: 'E-commerce React',
          description: 'Plataforma de ventas con carrito y pasarela de pago.',
          projectUrl: 'https://github.com'
        }
      ],
      contactEmail: 'juan@mock.com',
      whatsappNumber: '+56912345678',
      linkedinUrl: 'https://linkedin.com'
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
            whatsappNumber={profile.whatsappNumber}
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
            <div className="flex flex-wrap gap-3">
              {profile.skills?.map((s: any) => {
                const skillName = s.skill?.name || s.name || s;
                const isVerified = s.verified === true;
                
                if (isVerified) {
                  return (
                    <div key={skillName} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm" title="Habilidad Verificada Oficialmente">
                      <span className="flex items-center justify-center bg-blue-500 text-white rounded-full w-3.5 h-3.5 text-[8px]">✓</span>
                      {skillName}
                    </div>
                  );
                }

                return (
                  <span key={skillName} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-transparent">
                    {skillName}
                  </span>
                );
              })}
            </div>
          </div>

          {profile.experiences && profile.experiences.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Experiencia Laboral
              </h2>
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 md:ml-4 space-y-8">
                {profile.experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="relative pl-6 md:pl-8">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800"></div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exp.position}</h3>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 sm:mt-0 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-full w-fit">
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'N/A'} - {exp.current ? 'Presente' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'N/A')}
                      </span>
                    </div>
                    <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-3">{exp.company}</h4>
                    {exp.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.educations && profile.educations.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" /> Educación
              </h2>
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 md:ml-4 space-y-8">
                {profile.educations.map((edu: any, idx: number) => (
                  <div key={idx} className="relative pl-6 md:pl-8">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white dark:border-gray-800"></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                    <h4 className="text-md font-medium text-gray-600 dark:text-gray-400">{edu.institution}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.certifications && profile.certifications.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" /> Certificaciones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#111]">
                    <h3 className="font-bold text-gray-900 dark:text-white">{cert.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.languages && profile.languages.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500" /> Idiomas
              </h2>
              <div className="flex flex-wrap gap-4">
                {profile.languages.map((lang: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#111] min-w-[120px]">
                    <span className="font-bold text-gray-900 dark:text-white">{lang.name}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full mt-2">
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.portfolioItems && profile.portfolioItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-500" /> Portafolio y Proyectos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profile.portfolioItems.map((port: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-[#161616] overflow-hidden shadow-sm flex flex-col">
                    {port.imageUrl && (
                      <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
                        <Image src={port.imageUrl} alt={port.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{port.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{port.description}</p>
                      {port.projectUrl && (
                        <a href={port.projectUrl.startsWith('http') ? port.projectUrl : `https://${port.projectUrl}`} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                          Ver proyecto <Link2 className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
