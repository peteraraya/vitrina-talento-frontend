import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const imageUrl = `${domain}/api/og/${resolvedParams.slug}?template=minimal`;

  return {
    title: `Perfil Profesional | Vitrina Talento`,
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
    // Try to fetch full profile data (for rendering the public page)
    const res = await fetch(`${API_URL}/api/v1/profiles/${resolvedParams.slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      return <div>Error al cargar el perfil.</div>;
    }

    profile = await res.json();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <Navbar />
      <div className="container mx-auto p-8 max-w-3xl flex-1">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border">
          <div className="flex items-center gap-6 mb-8">
            {profile.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt="Avatar" className="w-24 h-24 rounded-full" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                Avatar
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
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
