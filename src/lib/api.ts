import { useAuthStore } from '@/store/useAuthStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

/**
 * Cliente HTTP base para realizar peticiones a la API del backend.
 * Implementa el patrón Singleton a través de inyección automática del token JWT
 * y el manejo centralizado de respuestas no autorizadas (401).
 *
 * @param endpoint - Ruta relativa de la API (ej. '/auth/login'). Se concatena con API_BASE_URL.
 * @param options - Configuraciones estándar de fetch (RequestInit).
 * @returns {Promise<Response>} Promesa con la respuesta de la petición HTTP.
 * @throws Lanzará un error si la red falla o la configuración del request es inválida.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, logout } = useAuthStore.getState();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Inyección del token Bearer si el usuario está autenticado
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Interceptor: Manejo de tokens expirados o sesión inválida
  if (response.status === 401) {
    logout();
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
  }

  return response;
}
