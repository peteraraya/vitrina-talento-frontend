import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  ProfileFormValues, 
  VisibilityFormValues, 
  AvailabilityFormValues 
} from '@/schemas/profile.schema';

export function useProfileQueries() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch Profile Data
  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await fetchApi('/profiles/me');
      if (!res.ok) {
        if (res.status === 404) {
          await fetchApi('/profiles', { method: 'POST' });
          const retryRes = await fetchApi('/profiles/me');
          return retryRes.json();
        }
        throw new Error('No se pudo obtener el perfil');
      }
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch Availability Data
  const availabilityQuery = useQuery({
    queryKey: ['availability', 'me'],
    queryFn: async () => {
      const res = await fetchApi('/availability/me');
      if (!res.ok) throw new Error('No se pudo obtener la disponibilidad');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Mutation for Profile Update
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await fetchApi('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Fallo al actualizar el perfil');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      alert('¡Perfil actualizado con éxito!');
    },
    onError: (err) => {
      if (err instanceof Error) alert(err.message);
      else alert('Ocurrió un error desconocido');
    },
  });

  // Mutation for Visibility Update
  const updateVisibilityMutation = useMutation({
    mutationFn: async (values: VisibilityFormValues) => {
      const res = await fetchApi('/profiles/me/visibility', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Fallo al actualizar la visibilidad');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      alert('¡Visibilidad actualizada con éxito!');
    },
    onError: (err) => {
      if (err instanceof Error) alert(err.message);
      else alert('Ocurrió un error desconocido');
    },
  });

  // Mutation for Availability Update
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (values: AvailabilityFormValues) => {
      const res = await fetchApi('/availability/me', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Fallo al actualizar la disponibilidad');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'me'] });
      alert('¡Disponibilidad actualizada con éxito!');
    },
    onError: (err) => {
      if (err instanceof Error) alert(err.message);
      else alert('Ocurrió un error desconocido');
    },
  });

  return {
    profileQuery,
    availabilityQuery,
    updateProfileMutation,
    updateVisibilityMutation,
    updateAvailabilityMutation,
  };
}
