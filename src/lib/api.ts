import { useAuthStore } from '@/store/useAuthStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const { accessToken, logout } = useAuthStore.getState();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Unauthorized, trigger logout
    logout();
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
  }

  return response;
}
