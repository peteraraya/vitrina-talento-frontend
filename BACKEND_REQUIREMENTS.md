# Instrucciones y Requisitos para el Backend (API v1)

Este documento detalla los *endpoints*, estructuras de datos y lógica de negocio que el equipo de Backend (ej. en NestJS, Node, Python, etc.) debe implementar para que el Frontend de **Vitrina tu Empleo** funcione al 100% una vez que se desactive el modo *Mock* (`NEXT_PUBLIC_USE_MOCK_API=false`).

---

## 1. Autenticación y Seguridad
El frontend utiliza **Zustand** para almacenar un JWT (`accessToken`) e inyectarlo en la cabecera `Authorization: Bearer <token>` de cada petición protegida.

### `POST /api/v1/auth/login`
- **Body Requerido:** `{ email, password }`
- **Respuesta (200 OK):** `{ "accessToken": "jwt_token_string" }`
- **Error (401):** Credenciales inválidas.

### `POST /api/v1/auth/register`
- **Body Requerido:** `{ email, password, role: "CANDIDATE" | "RECRUITER" }`
- **Respuesta (201 Created):** `{ "accessToken": "jwt_token_string" }`

**Manejo de Errores Global:** Si el token expira o es inválido, cualquier endpoint protegido debe devolver **HTTP 401 Unauthorized**. El frontend intercepta automáticamente este código y redirige al `/login`.

---

## 2. Gestión de Perfil del Usuario

### `GET /api/v1/profiles/me` (Protegido)
Devuelve el perfil del candidato autenticado.
- Si el perfil aún no ha sido creado, debe devolver **404 Not Found** (el frontend automáticamente hará un `POST` para inicializarlo).

### `POST /api/v1/profiles` (Protegido)
Inicializa un registro de perfil vacío en la base de datos asociado al usuario actual y genera un `slug` único (ej. `juan-perez-123`).

### `PATCH /api/v1/profiles/me` (Protegido)
Actualiza los datos completos.
- **Body:** Puede contener `displayName`, `headline`, `summary`, `location`, `yearsOfExperience`, `videoPitchUrl`, `githubUrl`, `linkedinUrl`, `portfolioUrl`, y arrays de `languages`, `educations`, `certifications`, `portfolioItems`, `references`, `licenses`. *(Revisar esquema completo en `src/schemas/profile.schema.ts`)*.
- **Importante:** Al enviar arreglos (como `portfolioItems`, `licenses`, etc.), el Backend sobreescribirá la lista completa, por lo que el Frontend siempre manda la lista actual íntegra.

### `PATCH /api/v1/profiles/me/visibility` (Protegido)
- **Body:** `{ visibility: "PUBLIC" | "ANONYMIZED" | "PRIVATE" }`

---

## 3. Disponibilidad Laboral

### `GET /api/v1/availability/me` (Protegido)
- **Respuesta:** `{ status, workMode, contractType, expectedSalaryMin, expectedSalaryMax, currency, salaryPeriod, willingToTravel, shiftWork, nightShift }`

### `PATCH /api/v1/availability/me` (Protegido)
Actualiza las preferencias laborales del candidato.

---

## 4. Estadísticas del Dashboard

### `GET /api/v1/profiles/me/share-stats` (Protegido)
Devuelve métricas de visualización para el Dashboard.
- **Respuesta Esperada:** `{ "totalThisWeek": 42, "byChannel": [] }`

---

## 5. Endpoints Públicos (SSR & OpenGraph)
Estos endpoints son consumidos sin token, directamente por los servidores de Next.js (Server Components) o robots de redes sociales. **La API debe validar la propiedad `visibility` del perfil antes de retornar datos** (ej. si es `PRIVATE`, retornar 404 o acceso denegado).

### `GET /api/v1/profiles/:slug` (Público)
Devuelve los datos necesarios para renderizar el perfil público en `/talento/:slug`.

### `GET /api/v1/profiles/:slug/share-card-data` (Público)
Un endpoint optimizado y ultraligero consumido exclusivamente por `/api/og` para generar la imagen de previsualización (OpenGraph) en WhatsApp/LinkedIn.
- **Respuesta Esperada:**
  ```json
  {
    "slug": "juan-perez",
    "displayName": "Juan Pérez",
    "headline": "Desarrollador Frontend Senior",
    "topSkills": ["React", "Next.js", "TypeScript"],
    "availabilityStatus": "Buscando activamente",
    "workMode": "Remoto",
    "location": "Chile",
    "avatarUrl": "https://..."
  }
  ```
