import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { LoginFormValues, RegisterFormValues } from '@/schemas/auth.schema';

export function useAuthQueries() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await fetchApi('/auth/login', {
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
      const res = await fetchApi('/auth/register', {
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
