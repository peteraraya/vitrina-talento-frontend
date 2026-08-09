import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import Image from 'next/image';

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

import { ArrowLeft, Mail, Bookmark, Phone, Link2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default async function PublicProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
  
  let profile;

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
          <Button variant="ghost" asChild className="gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <Link href="/talento">
              <ArrowLeft className="w-4 h-4" /> Volver al buscador
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
              <Bookmark className="w-4 h-4" /> Guardar
            </Button>
            
            {/* Solo mostramos contacto si NO es anónimo (o si el backend lo permite) */}
            {!isAnonymized && profile.contactEmail ? (
              <Button asChild className="gap-2 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <a href={`mailto:${profile.contactEmail}`}>
                  <Mail className="w-4 h-4" /> Contactar
                </a>
              </Button>
            ) : !isAnonymized && profile.linkedinUrl ? (
              <Button asChild className="gap-2 flex-1 sm:flex-none bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white shadow-md">
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Link2 className="w-4 h-4" /> Ver LinkedIn
                </a>
              </Button>
            ) : (
              <Button className="gap-2 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled>
                <Mail className="w-4 h-4" /> Solicitar Contacto
              </Button>
            )}
          </div>
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
                <span key={s.skill.name} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  {s.skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
