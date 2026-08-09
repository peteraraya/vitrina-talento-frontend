import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Slug es requerido', { status: 400 });
    }

    let data: any = {};

    if (slug === 'mock-slug') {
      data = {
        displayName: 'Candidato de Ejemplo',
        headline: 'Desarrollador Full Stack',
        topSkills: ['React', 'Node.js', 'TypeScript'],
        location: 'Santiago, Chile',
        workMode: 'REMOTE',
        availabilityStatus: 'IMMEDIATE',
        avatarUrl: null,
      };
    } else {
      // 1. Llamar al Backend (cache: 'no-store' asegura que siempre traiga el dato real)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      // Mantenemos la normalización para prevenir errores de doble slash
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      const profileRes = await fetch(`${baseUrl}/profiles/${slug}/share-card-data`, {
        cache: 'no-store',
      });

      if (!profileRes.ok) {
        data = {
          displayName: 'Perfil No Encontrado',
          headline: 'Completa tu perfil para compartir tu tarjeta',
          topSkills: [],
          location: '-',
          workMode: 'REMOTE',
          availabilityStatus: 'UNAVAILABLE',
          avatarUrl: null,
        };
      } else {
        data = await profileRes.json();
      }
    }

    // 2. Extraer los datos mapeando correctamente
    const name = data.displayName || 'Candidato Anónimo';
    const headline = data.headline || 'Profesional en Búsqueda';
    const skills = data.topSkills || [];
    const location = data.location || 'Remoto';
    const workMode = data.workMode || 'REMOTE';
    
    // Configuración de imagen de perfil o iniciales por defecto
    const avatarUrl = data.avatarUrl;
    const initials = name.substring(0, 2).toUpperCase();

    // Precargar imagen para evitar crash en edge runtime de Satori
    let avatarSrc = null;
    if (avatarUrl) {
      try {
        const imgRes = await fetch(avatarUrl);
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buf).toString('base64');
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          avatarSrc = `data:${contentType};base64,${base64}`;
        }
      } catch (err) {
        console.error('Error cargando avatarUrl para OG', err);
      }
    }

    // 3. Dibujar la tarjeta con Tailwind y Satori
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a', // Tailwind slate-900
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
            color: 'white',
          }}
        >
          {/* Header: Marca de la plataforma */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <span style={{ fontSize: 24, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 2 }}>
              VITRINA TU EMPLEO
            </span>
          </div>

          {/* Cuerpo principal: Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '-40px' }}>
            {/* Avatar */}
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 72,
                fontWeight: 'bold',
                color: '#0f172a',
                overflow: 'hidden',
                border: '6px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            >
              {avatarSrc ? (
                <img src={avatarSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>

            {/* Nombres y Título */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: '-1px',
                  color: '#f8fafc',
                }}
              >
                {name}
              </h1>
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 500,
                  margin: '10px 0 0 0',
                  color: '#38bdf8', // Tailwind sky-400
                }}
              >
                {headline}
              </h2>
            </div>
          </div>

          {/* Habilidades (Tags/Badges) */}
          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
              {skills.map((skill: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#bae6fd',
                    padding: '8px 20px',
                    borderRadius: '30px',
                    fontSize: 20,
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          )}

          {/* Footer: Ubicación y Modalidad */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '30px',
              marginTop: '40px',
            }}
          >
            {/* Ubicación */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span style={{ fontSize: 24, color: '#e2e8f0', fontWeight: 500 }}>{location}</span>
            </div>

            {/* Modalidad de trabajo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span style={{ fontSize: 24, color: '#e2e8f0', fontWeight: 500 }}>
                {workMode === 'REMOTE' ? 'Trabajo Remoto' : workMode === 'HYBRID' ? 'Trabajo Híbrido' : 'Presencial'}
              </span>
            </div>
            
            {/* Estado de Búsqueda */}
            {data.availabilityStatus === 'IMMEDIATE' && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                 <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
                 <span style={{ fontSize: 24, color: '#4ade80', fontWeight: 600 }}>Disponible Ahora</span>
               </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    // Retornamos un mensaje de error renderizado como imagen en caso de excepción
    return new ImageResponse(
      (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: 'white',
          fontSize: 32,
        }}>
          Error generando tarjeta
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
