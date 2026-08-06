import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const { searchParams } = new URL(req.url);
  const template = searchParams.get('template') ?? 'minimal';

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

  let data;

  if (USE_MOCK_API) {
    data = {
      slug: resolvedParams.slug,
      displayName: 'Juan Pérez (Mock)',
      headline: 'Desarrollador Frontend Senior',
      topSkills: ['React', 'Next.js', 'TypeScript'],
      availabilityStatus: 'Buscando activamente',
      workMode: 'Remoto',
      location: 'Chile',
      avatarUrl: null
    };
  } else {
    const res = await fetch(
      `${API_URL}/api/v1/profiles/${resolvedParams.slug}/share-card-data`,
      { next: { revalidate: 600 } } 
    );

    if (!res.ok) {
      return new Response('Not found', { status: 404 });
    }

    data = await res.json();
  }

  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const profileUrl = `${domain}/talento/${data.slug}`;

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 60,
        background: template === 'bold' ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : '#ffffff',
        color: template === 'bold' ? '#fff' : '#0F172A',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {data.avatarUrl && (
            <img
              src={data.avatarUrl}
              width={100}
              height={100}
              style={{ borderRadius: '50%' }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>{data.displayName}</div>
            <div style={{ fontSize: 24, opacity: 0.8 }}>{data.headline}</div>
          </div>
        </div>
  
        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          {data.topSkills.map((skill: string) => (
            <div key={skill} style={{
              padding: '8px 16px',
              background: template === 'bold' ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
              borderRadius: 999,
              fontSize: 18,
            }}>{skill}</div>
          ))}
        </div>
  
        <div style={{ display: 'flex', marginTop: 'auto', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 18 }}>
            <span>🟢 {data.availabilityStatus}</span>
            <span>{data.workMode} · {data.location}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 14, opacity: 0.7 }}>Ver perfil completo en</span>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{profileUrl}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
