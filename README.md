# Vouch — Frontend

Aplicación Angular del proyecto Vouch, una plataforma social de críticas ponderadas para videojuegos.

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 21.2.0 | Framework |
| TypeScript | 5.9.2 | Lenguaje |
| @angular/ssr | 21.2.7 | Server-Side Rendering |
| @jsverse/transloco | — | Internacionalización (i18n) |
| RxJS | 7.8.0 | Programación reactiva |
| Vitest | 4.0.8 | Testing |

---

## Arquitectura general

Arquitectura basada en **standalone components** (sin NgModules), con lazy loading por ruta y separación estricta de responsabilidades.

```
src/
├── app/
│   ├── core/                          # Singletons: servicios, guards, interceptors, tokens
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Protege rutas privadas
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Añade Bearer token a todas las requests
│   │   ├── models/
│   │   │   └── user.model.ts          # Interfaz User
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Login, logout, token, usuario actual
│   │   │   └── lang.service.ts        # Detección y cambio de idioma
│   │   └── tokens/
│   │       └── accept-language.token.ts  # Token DI para header Accept-Language
│   ├── features/                      # Módulos funcionales (lazy loaded)
│   │   ├── auth/
│   │   │   └── login/                 # Página de login con Google
│   │   └── landing/                   # Página de inicio
│   ├── shared/                        # Componentes reutilizables
│   │   └── components/
│   │       ├── header/                # Cabecera global con nav y auth
│   │       └── lang-switcher/         # Selector de idioma
│   ├── app.config.ts                  # Providers globales (browser)
│   ├── app.config.server.ts           # Providers adicionales (SSR)
│   ├── app.routes.ts                  # Definición de rutas
│   ├── app.routes.server.ts           # Render modes por ruta
│   └── transloco-loader.ts            # Loader HTTP de traducciones
├── environments/
│   └── environment.ts                 # Variables de entorno (dev)
└── public/
    └── i18n/                          # Archivos de traducción JSON
        ├── es.json
        ├── en.json
        ├── fr.json
        ├── pt.json
        └── it.json
```

---

## Configuración local

### Requisitos
- Node.js 24.x LTS
- Angular CLI 21.x

### Instalación
```bash
npm install
ng serve
```

### Variables de entorno (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://proyectovouchbe.local/api',
  googleClientId: 'tu_google_client_id',
};
```

---

## Características implementadas

### SSR — Server-Side Rendering

**Librería:** `@angular/ssr` 21.2.7

**Configuración de render modes** (`app.routes.server.ts`):
| Ruta | Modo | Motivo |
|---|---|---|
| `/` | Prerender | Contenido estático, óptimo para SEO |
| `/login` | Prerender | Contenido estático, óptimo para SEO |
| `**` | Client | Rutas dinámicas sin pre-renderizado |

**Decisión de arquitectura:** Se eligió SSR desde el inicio del proyecto porque refactorizar una aplicación grande a SSR es costoso. El coste de añadirlo en una base limpia es mínimo. En producción se sirve con Node.js + PM2 + Nginx como reverse proxy.

**Compatibilidad SSR:** Las APIs del navegador (`localStorage`, `document`, `window`, Google GSI) no están disponibles en el servidor. Se usa `isPlatformBrowser(PLATFORM_ID)` para proteger cualquier acceso a estas APIs. En Angular 21, `ngAfterViewInit` sí se ejecuta en el servidor durante el pre-rendering, por lo que requiere protección explícita.

---

### Auth — Google Identity Services + Sanctum

**Librerías:** Google Identity Services (script CDN en `index.html`), Angular HttpClient, Sanctum tokens

**Flujo completo:**
```
Usuario hace clic en "Iniciar sesión"
  → Navega a /login
    → Google GSI renderiza el botón nativo de Google
      → Usuario autentica con su cuenta Google (popup)
        → Google devuelve un credential (JWT firmado por Google)
          → LoginComponent envía el credential a AuthService
            → POST /api/auth/google { credential }
              → Backend verifica y devuelve { token, user }
                → AuthService guarda token y user en localStorage
                  → Redirige a /
```

**Almacenamiento:** Token y usuario en `localStorage`. Decisión estándar para SPAs en MVP. La alternativa más segura (HttpOnly cookies) se evaluará en producción.

**Interceptor:** `auth.interceptor.ts` añade automáticamente `Authorization: Bearer {token}` a todas las peticiones HTTP salientes si hay sesión activa.

**Protección de rutas:** `auth.guard.ts` redirige a `/login` si el usuario no está autenticado.

**Compatibilidad SSR:** `localStorage` y Google GSI están protegidos con `isPlatformBrowser`.

---

### i18n — Internacionalización

**Librería:** `@jsverse/transloco`

**Idiomas disponibles:** Español (`es`), Inglés (`en`), Francés (`fr`), Portugués (`pt`), Italiano (`it`)

**Archivos de traducción:** `public/i18n/{lang}.json` — cargados bajo demanda por idioma (lazy loading).

**Uso en templates:**
```html
{{ 'seccion.clave' | transloco }}
```

**Cambio de idioma en runtime:** Sin recarga de página. El componente `LangSwitcherComponent` expone los botones en el header. El idioma activo es un signal reactivo derivado de `TranslocoService.langChanges$` via `toSignal()`.

**Detección automática de idioma** (`LangService`):

```
Prioridad 1 — localStorage key 'lang'
  El usuario eligió explícitamente un idioma en una visita anterior.

Prioridad 2 — navigator.language (browser)
  Idioma configurado en el navegador del usuario.
  Más preciso que geolocalización por IP: refleja la preferencia real,
  no el país desde donde se conecta.

Prioridad 3 — 'es' (fallback)
  Ninguna detección produjo un idioma disponible.
```

**Por qué no IP geolocation:** Requiere API externa con rate limits, falla con VPNs, un país puede tener múltiples idiomas oficiales (Suiza, Bélgica, etc.).

**Por qué no Accept-Language header (SSR):** El token `REQUEST` de `@angular/ssr` no está disponible en Angular 21. El servidor siempre pre-renderiza en español; el cliente hidrata con el idioma correcto.

**Inicialización:** `provideAppInitializer` ejecuta `LangService.init()` antes de que Angular renderice nada, evitando parpadeos de idioma.

---

## Roadmap

### Fase 1 — Core (en progreso)
- [x] Estructura base (standalone components, lazy routes)
- [x] SSR configurado
- [x] Auth con Google Identity Services
- [x] i18n con Transloco (5 idiomas, detección automática)
- [ ] Página de perfil de usuario
- [ ] Buscador de productos (juegos)
- [ ] Ficha de producto con triple nota (Global, Pro, Trust)
- [ ] Formulario de crítica con sliders por categoría

### Fase 2 — Capa social
- [ ] Sistema de Follow (Críticos de confianza)
- [ ] Trust Score en tiempo real
- [ ] Gráfico de radar por categorías

### Fase 3 — Optimización y SEO
- [ ] Meta tags dinámicos por producto (OpenGraph)
- [ ] Sitemap dinámico
- [ ] Widget para streamers (OBS)
- [ ] Generador de infografías para redes sociales
