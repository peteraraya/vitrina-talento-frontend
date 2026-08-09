/**
 * @fileoverview Configuración centralizada de las rutas de la API.
 * Sigue el principio DRY para evitar strings hardcodeados en los servicios.
 */

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PROFILE: {
    ME: '/profiles/me',
    VISIBILITY: '/profiles/me/visibility',
    CREATE: '/profiles',
  },
  AVAILABILITY: {
    ME: '/availability/me',
  },
  STATS: {
    SHARE: '/profiles/me/share-stats',
  }
} as const;
