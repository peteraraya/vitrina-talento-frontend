import { useAuthStore } from '@/store/useAuthStore';
import { handleMockRequest } from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

/**
 * Cliente HTTP base para realizar peticiones a la API del backend.
 * Implementa el patrรณn Singleton a travรฉs de inyecciรณn automรกtica del token JWT
 * y el manejo centralizado de respuestas no autorizadas (401).
 *
 * @param endpoint - Ruta relativa de la API (ej. '/auth/login'). Se concatena con API_BASE_URL.
 * @param options - Configuraciones estรกndar de fetch (RequestInit).
 * @returns {Promise<Response>} Promesa con la respuesta de la peticiรณn HTTP.
 * @throws Lanzarรก un error si la red falla o la configuraciรณn del request es invรกlida.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Bypass de Mock API si está habilitado en entorno
  if (USE_MOCK_API) {
    return handleMockRequest(endpoint, options);
  }

  const { accessToken, logout } = useAuthStore.getState();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Inyecciรณn del token Bearer si el usuario estรก autenticado
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Interceptor: Manejo de tokens expirados o sesiรณn invรกlida
  if (response.status === 401) {
    logout();
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
  }

  return response;
}
