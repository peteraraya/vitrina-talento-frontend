import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { API_ROUTES } from '@/config/api.config';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { 
  ProfileFormValues, 
  VisibilityFormValues, 
  AvailabilityFormValues 
} from '@/schemas/profile.schema';

/**
 * Custom Hook que encapsula la capa de acceso a datos para la gestión del Perfil.
 * 
 * Expone un servicio unificado para hidratar la UI con datos de perfil y disponibilidad,
 * además de proveer las mutaciones correspondientes con invalidación inteligente de caché.
 *
 * @returns {Object} Queries y mutaciones listas para ser consumidas por las vistas.
 */
export function useProfileQueries() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch Profile Data
  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await fetchApi(API_ROUTES.PROFILE.ME);
      if (!res.ok) {
        if (res.status === 404) {
          await fetchApi(API_ROUTES.PROFILE.CREATE, { method: 'POST' });
          const retryRes = await fetchApi(API_ROUTES.PROFILE.ME);
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
      const res = await fetchApi(API_ROUTES.AVAILABILITY.ME);
      if (!res.ok) throw new Error('No se pudo obtener la disponibilidad');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Mutation for Photo Upload
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // fetchApi usa application/json por defecto, debemos eliminar el header para multipart/form-data
      // para que fetch calcule el boundary automáticamente.
      const { accessToken } = useAuthStore.getState();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      
      const res = await fetch(`${API_BASE_URL}/profiles/me/photo`, {
        method: 'POST',
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Fallo al subir la imagen de perfil');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });

  // Mutation for Profile Update
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await fetchApi(API_ROUTES.PROFILE.ME, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Fallo al actualizar el perfil');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });

  // Mutation for Visibility Update
  const updateVisibilityMutation = useMutation({
    mutationFn: async (values: VisibilityFormValues) => {
      const res = await fetchApi(API_ROUTES.PROFILE.VISIBILITY, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Fallo al actualizar la visibilidad');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });

  // Mutation for Availability Update
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (values: AvailabilityFormValues) => {
      const res = await fetchApi(API_ROUTES.AVAILABILITY.ME, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Fallo al actualizar la disponibilidad');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'me'] });
    },
  });

  return {
    profileQuery,
    availabilityQuery,
    updateProfileMutation,
    updateVisibilityMutation,
    updateAvailabilityMutation,
    uploadPhotoMutation,
  };
}
