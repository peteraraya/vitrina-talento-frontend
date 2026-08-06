import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { API_ROUTES } from '@/config/api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { LoginFormValues, RegisterFormValues } from '@/schemas/auth.schema';

/**
 * Custom Hook que encapsula la capa de acceso a datos para flujos de autenticación.
 * 
 * Sigue el principio de Responsabilidad Única (SRP), delegando a React Query 
 * el manejo de estados de carga, reintentos y promesas.
 * 
 * @returns {Object} Un objeto con las mutaciones de React Query para Login y Registro.
 */
export function useAuthQueries() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await fetchApi(API_ROUTES.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Credenciales inválidas');
      return res.json();
    },
    onSuccess: (data) => {
      setAuth(data.accessToken);
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const res = await fetchApi(API_ROUTES.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Fallo en el registro');
      return res.json();
    },
    onSuccess: (data) => {
      setAuth(data.accessToken);
      router.push('/dashboard');
    },
  });

  return {
    loginMutation,
    registerMutation,
  };
}
