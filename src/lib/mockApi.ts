/**
 * @fileoverview Lógica de Mock API para desarrollo sin backend.
 */

import { API_ROUTES } from '@/config/api.config';

const MOCK_DELAY = 800; // Simular latencia de red

// Datos ficticios (Dummys)
const DUMMY_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI... dummy_token';

let DUMMY_PROFILE = {
  displayName: 'Juan Pérez (Mock)',
  headline: 'Desarrollador Frontend Senior',
  summary: 'Apasionado por React y Next.js. Creando interfaces hermosas. Me enfoco en rendimiento y escalabilidad.',
  location: 'Santiago, Chile',
  yearsOfExperience: 5,
  videoPitchUrl: '',
  phoneNumber: '',
  whatsappNumber: '+56912345678',
  contactEmail: 'contacto@juanperez.com',
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  portfolioUrl: 'https://mi-portfolio.com',
  instagramUrl: '',
  twitterUrl: '',
  facebookUrl: '',
  visibility: 'ANONYMIZED',
  languages: [{ name: 'Inglés', level: 'Avanzado' }, { name: 'Español', level: 'Nativo' }],
  educations: [{ institution: 'Universidad de Mock', degree: 'Ingeniería', fieldOfStudy: 'Software' }],
  certifications: [{ name: 'AWS Certified', issuer: 'Amazon', credentialUrl: '' }],
  portfolioItems: [{ title: 'Sistema ERP', description: 'Sistema de ventas construido con Next.js', imageUrl: '', projectUrl: '' }],
  references: [{ name: 'Carlos Díaz', company: 'Tech Corp', phoneNumber: '+56900000000', email: '', relationship: 'Ex-Jefe' }],
  licenses: [{ name: 'Licencia Scrum Master' }],
  skills: ['React', 'Next.js', 'TypeScript', 'Liderazgo'],
};

let DUMMY_AVAILABILITY = {
  status: 'TWO_WEEKS',
  workMode: 'REMOTE',
  contractType: 'FULL_TIME',
  expectedSalaryMin: 3000,
  expectedSalaryMax: 5000,
  currency: 'USD',
  salaryPeriod: 'MONTHLY',
  willingToTravel: false,
  shiftWork: false,
  nightShift: false,
};

const createMockResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const handleMockRequest = async (endpoint: string, options: RequestInit): Promise<Response> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  const method = options.method || 'GET';

  console.log(`[MOCK API] ${method} ${endpoint}`);

  // Auth
  if (endpoint === API_ROUTES.AUTH.LOGIN || endpoint === API_ROUTES.AUTH.REGISTER) {
    return createMockResponse({ accessToken: DUMMY_TOKEN });
  }

  // Profile Get
  if (endpoint === API_ROUTES.PROFILE.ME && method === 'GET') {
    return createMockResponse(DUMMY_PROFILE);
  }

  // Profile Create/Update
  if (endpoint === API_ROUTES.PROFILE.ME && method === 'PATCH') {
    if (options.body) {
      DUMMY_PROFILE = { ...DUMMY_PROFILE, ...JSON.parse(options.body as string) };
    }
    return createMockResponse({ success: true, profile: DUMMY_PROFILE });
  }

  if (endpoint === API_ROUTES.PROFILE.CREATE && method === 'POST') {
    return createMockResponse({ success: true, profile: DUMMY_PROFILE });
  }

  // Profile Visibility Update
  if (endpoint === API_ROUTES.PROFILE.VISIBILITY && method === 'PATCH') {
    if (options.body) {
      DUMMY_PROFILE.visibility = JSON.parse(options.body as string).visibility;
    }
    return createMockResponse({ success: true, visibility: DUMMY_PROFILE.visibility });
  }

  // Availability Get
  if (endpoint === API_ROUTES.AVAILABILITY.ME && method === 'GET') {
    return createMockResponse(DUMMY_AVAILABILITY);
  }

  // Availability Update
  if (endpoint === API_ROUTES.AVAILABILITY.ME && method === 'PATCH') {
    if (options.body) {
      DUMMY_AVAILABILITY = { ...DUMMY_AVAILABILITY, ...JSON.parse(options.body as string) };
    }
    return createMockResponse({ success: true, availability: DUMMY_AVAILABILITY });
  }

  // Dashboard stats
  if (endpoint === '/profiles/me/share-stats' && method === 'GET') {
    return createMockResponse({ totalThisWeek: 42, byChannel: [] });
  }

  // Default fallback
  return createMockResponse({ message: 'Mock route not implemented' }, 404);
};
