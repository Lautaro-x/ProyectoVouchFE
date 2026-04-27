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

Arquitectura basada en **standalone components** (sin NgModules), con lazy loading por ruta y separación estricta de responsabilidades. Estado reactivo centralizado en **Angular Signals**. `ChangeDetectionStrategy.OnPush` en todos los componentes.

```
src/
├── app/
│   ├── core/
│   │   ├── constants/
│   │   │   └── langs.ts                   # Array LANGS y LANG_LOCALES compartidos
│   │   ├── guards/
│   │   │   ├── auth.guard.ts              # Protege rutas privadas
│   │   │   └── admin.guard.ts             # Protege /administration (role === 'admin')
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts        # Añade Bearer token a todas las requests
│   │   ├── models/
│   │   │   ├── product.model.ts           # Interfaces públicas: ProductCard, ProductDetail, ReviewFormData…
│   │   │   └── user.model.ts              # Interfaz User
│   │   ├── services/
│   │   │   ├── api.service.ts             # Métodos tipados para todos los endpoints públicos
│   │   │   ├── auth.service.ts            # Login, logout, token, usuario actual
│   │   │   └── lang.service.ts            # Detección y cambio de idioma
│   │   ├── tokens/
│   │   │   └── accept-language.token.ts   # Token DI para header Accept-Language
│   │   └── utils/
│   │       ├── datetime.utils.ts          # utcToLocal() / localToUTC()
│   │       └── localized-value.ts         # localizedValue(record, lang) con fallback
│   ├── features/
│   │   ├── auth/
│   │   │   └── login/                     # Página de login con Google
│   │   ├── landing/                       # Página de inicio (Prerender)
│   │   ├── games/
│   │   │   └── game-list/                 # Listado paginado de juegos con filtros
│   │   ├── product-detail/                # Detalle de producto (tabs, trailer, screenshots)
│   │   │   └── review-share/              # Modal de compartir reseña propia
│   │   ├── review-create/                 # Formulario de nueva reseña
│   │   ├── review-edit/                   # Formulario de edición de reseña
│   │   ├── public-profile/                # Perfil público responsive (/u/:id)
│   │   ├── public-card/
│   │   │   ├── big-card-page/             # Card 720×430 (/card/big/:id)
│   │   │   ├── mid-card-page/             # Card 480×480 (/card/mid/:id)
│   │   │   └── mini-card-page/            # Card 360×160 (/card/mini/:id)
│   │   ├── not-found/                     # Página 404 personalizada
│   │   ├── user/                          # Sección privada (/user)
│   │   │   ├── layout/                    # Shell con sidebar de usuario
│   │   │   ├── profile/                   # Edición de perfil, fondos de cards
│   │   │   ├── public-profile/            # Vista previa del perfil público + copiar links
│   │   │   ├── consents/                  # show_email, consent_follower_score
│   │   │   ├── reviews/                   # Mis reseñas paginadas
│   │   │   ├── badges/                    # Logros: progreso y reclamación
│   │   │   ├── followers/                 # Lista de seguidores
│   │   │   └── verify-request/            # Solicitud de badge verificado / acceso de prensa
│   │   └── admin/                         # Panel de administración (/administration)
│   │       ├── layout/                    # Shell con sidebar admin
│   │       ├── admin-table.base.ts        # Clase abstracta con estado y métodos de tabla compartidos
│   │       ├── admin-shared.css           # Estilos comunes del panel
│   │       ├── models/
│   │       │   └── admin.models.ts        # Interfaces TypeScript del panel admin
│   │       ├── services/
│   │       │   └── admin-api.service.ts   # Métodos tipados para todos los endpoints admin
│   │       ├── genres/                    # CRUD Géneros + asignación de categorías con pesos
│   │       ├── categories/                # CRUD Categorías
│   │       ├── platforms/                 # CRUD Plataformas
│   │       ├── products/                  # CRUD Productos + búsqueda/importación IGDB
│   │       ├── reviews/                   # Gestión de reseñas (banear/desbanear)
│   │       ├── users/                     # Gestión de usuarios (banear, roles, badge verificado)
│   │       ├── surveys/                   # CRUD Encuestas multilingüe + resultados
│   │       ├── announcements/             # CRUD Avisos multilingüe
│   │       └── verify-requests/           # Revisión de solicitudes de verificación
│   ├── shared/
│   │   ├── components/
│   │   │   ├── breadcrumb/                # Breadcrumb auto-prepend "Home"
│   │   │   ├── dialog/                    # Modal genérico con ng-content
│   │   │   ├── game-card/                 # Card de producto para grids y listados
│   │   │   ├── header/                    # Cabecera global con nav, encuestas y avisos
│   │   │   ├── lang-switcher/             # Selector de idioma
│   │   │   ├── store-icon/                # Iconos SVG de tiendas (Steam, GOG, Epic…)
│   │   │   └── user-profile-card/         # Cards compartibles (Big, Mid, Mini)
│   │   └── pipes/
│   │       ├── igdb-cover.pipe.ts         # Transforma URL de portada IGDB (t_cover_small / t_cover_big)
│   │       ├── localized-name.pipe.ts     # Muestra TranslatableName en el locale activo
│   │       └── safe-url.pipe.ts           # DomSanitizer para iframes de YouTube
│   ├── app.ts                             # Componente raíz
│   ├── app.config.ts                      # Providers globales (browser)
│   ├── app.config.server.ts               # Providers adicionales (SSR)
│   ├── app.routes.ts                      # Definición de rutas
│   ├── app.routes.server.ts               # Render modes por ruta
│   └── transloco-loader.ts                # Loader HTTP de traducciones
├── environments/
│   └── environment.ts
└── public/
    └── i18n/
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
  pressEmail: 'press@vouch.gg',
  vouchSocials: { twitter: '...', instagram: '...' },
};
```

---

## SSR — Server-Side Rendering

**Librería:** `@angular/ssr` 21.2.7

**Render modes** (`app.routes.server.ts`):

| Ruta | Modo | Motivo |
|---|---|---|
| `/` | Prerender | Contenido estático, óptimo para SEO |
| `/login` | Prerender | Contenido estático |
| `/not-found` | Prerender | Contenido estático |
| `/games` | Server | Contenido dinámico, indexable |
| `/product/:type/:slug` | Server | OG tags dinámicos por producto |
| `/u/:id` | Server | OG tags dinámicos por usuario |
| `/card/big/:id` | Server | OG tags para compartir en redes |
| `/card/mid/:id` | Server | OG tags para compartir en redes |
| `/card/mini/:id` | Server | OG tags para compartir en redes |
| `**` | Client | Rutas privadas sin pre-renderizado |

**Compatibilidad SSR:** `localStorage`, `document`, `window` y Google GSI no están disponibles en el servidor. Todo acceso está protegido con `isPlatformBrowser(PLATFORM_ID)`.

---

## Auth — Google Identity Services + Sanctum

**Flujo:**
```
Usuario hace clic en "Iniciar sesión"
  → Navega a /login
    → Google GSI renderiza el botón nativo
      → Usuario autentica con su cuenta Google
        → Google devuelve credential (JWT firmado)
          → POST /api/auth/google { credential }
            → Backend verifica y devuelve { token, user }
              → AuthService guarda token y user en localStorage
                → Redirige a /
```

**Interceptor:** `auth.interceptor.ts` añade `Authorization: Bearer {token}` a todas las peticiones HTTP si hay sesión activa.

**Guards:**
- `auth.guard.ts` — redirige a `/login` si no está autenticado
- `admin.guard.ts` — redirige a `/` si no tiene `role === 'admin'`

---

## i18n — Internacionalización

**Librería:** `@jsverse/transloco`

**Idiomas:** Español (`es`), Inglés (`en`), Francés (`fr`), Portugués (`pt`), Italiano (`it`)

**Archivos:** `public/i18n/{lang}.json` — cargados bajo demanda por idioma.

**Detección automática** (`LangService`):
```
1. localStorage key 'lang'      → el usuario lo eligió antes
2. navigator.language (browser) → preferencia real del navegador
3. 'es'                         → fallback
```

**Inicialización:** `provideAppInitializer` ejecuta `LangService.init()` antes de que Angular renderice nada, evitando parpadeos de idioma.

**Constantes compartidas** (`core/constants/langs.ts`): `LANGS` y `LANG_LOCALES` usados en los formularios multilingüe del panel admin para evitar repetición.

---

## Características implementadas

### Landing (`/`)

Página de inicio con dos secciones:

- **Nuevos lanzamientos relevantes** — hasta 10 productos con score ≥ 80 (`GET /api/products/relevant`), en grid de 5 columnas (3 tablet, 2 móvil). Sin border-radius, borde de 1 px en `--color-accent`, sin título visible en la card.
- **Últimos tráilers** — hasta 20 juegos con `trailer_youtube_id` (`GET /api/products/trailers`). Layout de dos columnas: izquierda, una estantería CSS con 2 baldas (columnas de lomos de libro clicables); derecha, iframe de YouTube embebido del tráiler seleccionado. En tablet/móvil: el reproductor va arriba y la estantería se colapsa a 1 balda debajo. El primer tráiler se selecciona automáticamente. Usa `SafeUrlPipe` para sanear la URL del iframe. La selección del tráiler activo se gestiona con signals (`selectedTrailer`, `trailersLeft`, `trailersRight`, `youtubeUrl` como computed).

---

### Listado de juegos (`/games`)

Listado paginado de juegos con:
- **Búsqueda** por título (debounce 400ms con RxJS `Subject`)
- **Filtros** por género, desarrollador, distribuidora, temática, modo de juego y perspectiva
- **Chip de filtro activo** visible con botón de limpiar
- **Infinite scroll** via `IntersectionObserver` sobre un sentinel element
- **Breadcrumb** con soporte para filtro activo como ítem dinámico
- `takeUntilDestroyed(destroyRef)` para limpiar suscripciones automáticamente

---

### Detalle de producto (`/product/:type/:slug`)

Página de detalle con:
- **Aside sticky:** portada, scores (Global, Pro, Trust, Follower, IGDB), nota del usuario autenticado con botones de editar y compartir
- **Tabs para juegos:**
  - *Presentación* — tráiler YouTube embebido + descripción
  - *Datos básicos* — desarrollador, distribuidora, franquicia, plataformas con links de tienda (iconos SVG)
  - *Características* — temáticas, modos de juego, perspectivas (todos como filtros clicables)
- **Links de tienda** — `StoreIconComponent` con iconos de Steam, GOG, Epic Games, PlayStation Store, Xbox, Nintendo eShop
- **Sección de reseñas** con infinite scroll, expansión de texto largo, avatar con fallback
- **Score blocks:** Global (usuarios), Pro (críticos), Trust (seguidos), Follower (seguidores), IGDB (cuando no hay votos propios)

**`ReviewShareComponent`** — modal que abre el generador de imagen de reseña al pulsar el icono de compartir.

---

### Formulario de reseña (`/review/new/:productId`, `/review/edit/:reviewId`)

Formulario de crítica ponderada por categorías. Carga `GET /api/products/{id}/review-form` para obtener las categorías del producto y sus pesos. Sliders 0–10 por categoría. En edición, pre-rellena los scores actuales vía `GET /api/reviews/{id}/edit-form`.

CSS compartido en `features/review-form.css`.

---

### Perfil público (`/u/:id`)

Página pública sin header ni breadcrumb. Muestra avatar, nombre, badges, estadísticas (reseñas + seguidores), últimas 3 reseñas con portada y nota, email (si público) y links sociales. Renderizada en modo Server para OG tags. Responsive hasta móvil.

---

### Cards compartibles (`/card/big/:id`, `/card/mid/:id`, `/card/mini/:id`)

Tres tamaños de card para embeber o compartir. CSS encapsulado con prefijos únicos para portabilidad fuera de la app.

| Card | Tamaño | Prefijo CSS |
|---|---|---|
| Big Card | 720×430 px | `.vfc-*` |
| Mid Card | 480×480 px | `.vsc-*` |
| Mini Card | 360×160 px | `.vmc-*` |

Todas en modo Server. Usan `UserProfileCardComponent` para renderizar el contenido.

---

### Sección de usuario (`/user`)

Shell con sidebar lateral (`UserLayoutComponent`) y rutas hijas lazy:

| Ruta | Descripción |
|---|---|
| `/user/profile` | Edición de nombre, avatar, bio, links sociales, fondos de cards |
| `/user/public-profile` | Vista previa del perfil público + copiar enlace de cada card |
| `/user/consents` | Gestión de `show_email` y `consent_follower_score` |
| `/user/reviews` | Mis reseñas paginadas con búsqueda |
| `/user/badges` | Progreso de logros y reclamación (claim-based) |
| `/user/followers` | Lista de seguidores (máx. 100 mostrados, total real) |
| `/user/verify-request` | Solicitud de badge verificado o acceso de prensa |

---

### Panel de administración (`/administration`)

Ruta no enlazada en ningún menú público. Protegida por `AdminGuard`. Shell con sidebar (`AdminLayoutComponent`).

#### `AdminTableBase<T>` (clase abstracta)

Base compartida por todos los componentes de listado admin. Provee:
- Signals: `page`, `perPage`, `sortBy`, `sortDir`, `filterSearch`
- Signals de confirmación: `confirmDialogOpen`, `confirmDialogTitle`, `confirmDialogSubtitle`
- Métodos: `setSort`, `sortIcon`, `setPerPage`, `goTo`, `pages`, `openConfirm`, `confirmAction`, `closeConfirm`
- Método abstracto: `load(p?)` — implementado por cada subclase

#### AdminApiService

Servicio centralizado con métodos tipados para todos los endpoints admin. Devuelve `Observable<T>`.

#### Modelos TypeScript (`admin.models.ts`)

`Genre`, `Category`, `CategoryWithWeight`, `Platform`, `PlatformWithPivot`, `Product`, `GameDetail`, `AdminReview`, `AdminUser`, `Survey`, `SurveyOption`, `SurveyResults`, `Announcement`, `VerificationRequestAdmin`, `IgdbGame`, `IgdbImportReport`, `Paginated<T>`, `TranslatableName`.

#### Secciones del panel

**Géneros** — CRUD + asignación de categorías con pesos (0.00–1.00) por género. Formulario multilingüe (5 idiomas). Búsqueda en tabla. `igdb_genre_id` configurable.

**Categorías** — CRUD con formulario multilingüe. El slug se genera en el backend a partir del nombre en inglés.

**Plataformas** — CRUD con tipo (`console | pc | streaming`).

**Productos** — Listado paginado con filtros (búsqueda, tipo, género). CRUD con campos `GameDetails` embebidos (developer, publisher) y selección de géneros con checkboxes. Funciones IGDB:
- Búsqueda por nombre con indicador "ya importado" por juego
- Importación individual con un clic
- "Importar últimas 48h" — importa en batch con reporte (importados/omitidos/errores)
- "Sync IGDB" por producto — re-sincroniza datos desde IGDB
- Diálogo de links de compra — inputs por tienda agrupados por plataforma

**Reseñas** — Listado paginado, filtro por baneadas, banear con motivo / desbanear.

**Usuarios** — Listado paginado, filtros por estado y rol, cambio de rol inline, banear/desbanear, otorgar/revocar badge `verificado`.

**Encuestas** — CRUD con título, pregunta y opciones multilingüe (5 idiomas). Selector de audiencia (`all | verified | press`). Pastillas de estado (upcoming/active/ended/missing\_translations). Botón de resultados con barras de progreso.

**Avisos** — CRUD con título y cuerpo multilingüe. Selector de audiencia. Pastillas de estado.

**Solicitudes de verificación** — Tabla filtrable por estado (pending/approved/rejected). Dialog de revisión con botones Aprobar/Rechazar y nota interna opcional.

---

### Header (`HeaderComponent`)

Cabecera global presente en todas las rutas no-admin y no-card. Incluye:
- Navegación principal
- `LangSwitcherComponent`
- Login/logout con Google
- **Icono de encuestas** — tooltip con encuestas activas no respondidas; abre dialog con radio buttons para responder
- **Icono de avisos** — tooltip con avisos activos; abre dialog con contenido (icono permanente, no desaparece al leer)

El header se oculta automáticamente en rutas bajo `/administration` mediante un signal derivado de los eventos del router.

---

## Componentes compartidos

### `BreadcrumbComponent`

Auto-prepende "Home" (enlace a `/`). Las páginas pasan solo el resto del path vía `[items]`. Usa `labelKey` para claves i18n y `label` para texto dinámico.

```html
<app-breadcrumb [items]="[{ labelKey: 'nav.games', path: '/games' }, { label: product().title }]" />
```

### `DialogComponent`

Modal genérico con `<ng-content>`. Se cierra con la tecla Escape, clic en el backdrop o el botón X. Inputs: `title`, `subtitle`, `isOpen`. Output: `(closed)`.

### `GameCardComponent`

Card de producto para grids y listados. Input: `product: ProductCard`. Muestra portada (via `IgdbCoverPipe`), título, nota con clase de color, tipo y — si el usuario sigue a alguien que lo ha reseñado en el último mes — su nota (Trust) flotando sobre la portada.

### `UserProfileCardComponent`

Renderiza las tres cards (Big, Mid, Mini) en función de un `size` input. Incluye seguir/dejar de seguir, copiar enlace y badges de usuario.

### `StoreIconComponent`

Renderiza el icono SVG de una tienda a partir de una clave. Claves soportadas: `steam`, `gog`, `epic`, `ps_store`, `xbox`, `eshop`. Fallback: icono de carrito. Todos los SVGs usan `fill="currentColor"` para adaptarse al tema. Fuente: Simple Icons (CC0).

```html
<app-store-icon key="steam" />
```

---

## Pipes compartidos

| Pipe | Descripción |
|---|---|
| `localizedName` | Recibe `TranslatableName` y devuelve el valor en el locale activo con fallback a `en`. `pure: false` — reacciona al cambio de idioma. |
| `igdbCover` | Transforma URLs de portada IGDB. Parámetro: `'small'` → `t_cover_small`, `'big'` → `t_cover_big`. |
| `safeUrl` | Marca URLs como seguras para iframes (YouTube) usando `DomSanitizer`. |

---

## Convenciones

- Todos los componentes son **standalone** (sin NgModules)
- Estado reactivo con **Angular Signals** (`signal`, `computed`, `input()`, `output()`)
- `ChangeDetectionStrategy.OnPush` en todos los componentes
- `takeUntilDestroyed(destroyRef)` para limpiar suscripciones RxJS
- Sin `ngModel` — property binding + event binding manual
- Sin comentarios en el código
- Pipes de `@angular/common` importados explícitamente en cada componente
- Variables CSS globales de `styles.css` para colores; nunca hexadecimales hardcodeados
- Clases reutilizables entre componentes (`.grade-*`) en `styles.css`, no en CSS de componente
- Toda `<img>` incluye `loading` y `decoding` explícitos; portadas IGDB pasan por `IgdbCoverPipe`
- Todas las páginas públicas (excepto landing y admin) incluyen `<app-breadcrumb>`

---

## Roadmap

### Fase 1 — Core y Admin (completada)
- [x] Estructura base (standalone components, lazy routes, SSR)
- [x] Auth con Google Identity Services + Sanctum
- [x] i18n con Transloco (5 idiomas, detección automática)
- [x] Panel de administración (`/administration`) con AdminGuard
- [x] CRUD Géneros con asignación de categorías y pesos
- [x] CRUD Categorías, Plataformas, Productos
- [x] Gestión de Reseñas y Usuarios (banear/desbanear, roles, badge verificado)
- [x] Importación de juegos desde IGDB (individual, batch 48h, sync por producto)
- [x] Links de compra por tienda con iconos SVG (`StoreIconComponent`)
- [x] CRUD Encuestas y Avisos multilingüe con audiencia
- [x] Gestión de solicitudes de verificación
- [x] `DialogComponent`, `BreadcrumbComponent` reutilizables
- [x] `AdminTableBase` — clase abstracta para tablas admin
- [x] `LocalizedNamePipe`, `IgdbCoverPipe`, `SafeUrlPipe`

### Fase 2 — Pública (completada)
- [x] Landing con productos relevantes
- [x] Listado de juegos con filtros y búsqueda (infinite scroll)
- [x] Detalle de producto (triple score, tabs, trailer, plataformas, links de tienda)
- [x] Formulario de reseña y edición (scores por categoría)
- [x] Trust Score y Follower Score en detalle de producto
- [x] Reseñas públicas paginadas con infinite scroll
- [x] Página 404 personalizada

### Fase 3 — Capa social (completada)
- [x] Perfil de usuario privado (edición, fondos de cards, consentimientos)
- [x] Perfil público responsive (`/u/:id`) con OG tags SSR
- [x] Cards compartibles Big/Mid/Mini con fondos personalizables
- [x] Sistema de seguimiento (follow/unfollow)
- [x] Sistema de badges claim-based (reseñas + seguidores)
- [x] Sistema de encuestas activas en el header
- [x] Sistema de avisos en el header
- [x] Solicitud de verificación (badge + acceso prensa)
- [x] Consentimientos (`show_email`, `consent_follower_score`)
- [x] Lista de seguidores
- [x] Generador de imagen de crítica (canvas 1080×1080)
- [x] Compartir reseña desde el detalle de producto

### Fase 4 — Optimización (completada)
- [x] `ChangeDetectionStrategy.OnPush` en todos los componentes
- [x] `takeUntilDestroyed` en suscripciones RxJS
- [x] SSR en rutas públicas y de cards para OG tags e indexación

### Fase 5 — Pre-producción
- [x] Meta tags dinámicos por producto y usuario (OpenGraph completo)
- [x] Sitemap dinámico
- [ ] Identidad visual definitiva (tipografía, paleta, personalidad)

### Fase 6 — Post-producción
- [ ] Verificar SSR en producción (view-source, Facebook Debugger)
- [ ] Widget para streamers (OBS)
- [x] Generador de infografías para redes sociales
- [ ] Juegos recomendados al usuario (ML o scoring heurístico)

---

## Checklist de producción

Todo lo que hay que hacer antes de subir el frontend a un servidor real.

### Variables de entorno y configuración

- [ ] Actualizar `src/environments/environment.ts` (o crear `environment.prod.ts`) con valores reales:
  - `baseUrl` → dominio real del frontend (ej: `https://vouch.gg`)
  - `apiUrl` → dominio real del backend (ej: `https://api.vouch.gg/api`)
  - `googleClientId` → mismo Client ID que el backend
  - `pressEmail` → email real de prensa
  - `vouchSocials` → URLs reales de las redes sociales de Vouch
- [ ] Configurar la variable de entorno `API_URL` en el servidor Node.js / PM2 apuntando al backend sin `/api` (ej: `https://api.vouch.gg`) — la usa `server.ts` para el proxy del sitemap
- [ ] Actualizar `public/robots.txt`: línea `Sitemap:` con la URL definitiva (ej: `Sitemap: https://vouch.gg/sitemap.xml`)

### Build y servidor

- [ ] `npm run build` (genera `dist/` con browser + server bundles)
- [ ] Configurar proceso Node.js persistente con PM2 u otro process manager:
  ```bash
  pm2 start dist/proyectovouchfe/server/server.mjs --name vouch-ssr
  ```
- [ ] Configurar nginx/Apache como reverse proxy al proceso Node (puerto 4000 por defecto)

### Verificación post-deploy

- [ ] `view-source:https://vouch.gg/games` → debe mostrar HTML con contenido real, no `<app-root></app-root>` vacío
- [ ] `view-source:https://vouch.gg/product/game/{slug}` → debe incluir `<title>` y `<meta property="og:*">` con datos del juego
- [ ] Verificar OG tags con [Facebook Debugger](https://developers.facebook.com/tools/debug/) o Twitter Card Validator
- [ ] `https://vouch.gg/sitemap.xml` devuelve XML con todas las rutas de productos
- [ ] Registrar `https://vouch.gg/sitemap.xml` en Google Search Console
- [ ] `https://vouch.gg/robots.txt` accesible y con la URL del sitemap correcta

---

## Novedades recientes

- **Sección "Últimos tráilers" en landing** — estantería CSS con 2 baldas de lomos clicables (1 en móvil) + iframe de YouTube del tráiler seleccionado. Endpoint `GET /api/products/trailers`. Selección reactiva via signals.
- **Sitemap dinámico** — `GET /sitemap.xml` en el frontend (Express en `server.ts`) actúa como proxy hacia el endpoint `GET /sitemap.xml` del backend Laravel. Laravel genera el XML con `SitemapController` + vista Blade `sitemap.blade.php`, incluyendo `/`, `/games` y todas las rutas `/product/{type}/{slug}` con `lastmod` real. La URL base del frontend se lee de la variable de entorno `FRONTEND_URL`. `public/robots.txt` creado con `Disallow` para rutas privadas y directiva `Sitemap:`. En producción hay que actualizar la URL del sitemap en `robots.txt` con el dominio real.
- **Meta tags dinámicos (OpenGraph completo)** — `<title>` y tags OG/Twitter configurados por ruta: detalle de producto (título del juego + portada + descripción truncada a 160 chars), listado de juegos (con label del filtro activo si aplica), landing (tags estáticos de la plataforma). Las páginas de perfil público y cards ya tenían meta tags. `index.html` corregido: título base "Vouch — Críticas ponderadas de videojuegos", `twitter:card` corregido a `summary_large_image`. Con SSR activo en las rutas públicas, los crawlers (Google, Discord, WhatsApp, Twitter) reciben el HTML pre-renderizado con los tags correctos.
- **StoreIconComponent** — nuevo componente compartido con iconos SVG (Simple Icons, CC0) para Steam, GOG, Epic Games, PlayStation Store, Xbox y Nintendo eShop. Se usa en el detalle de producto para los links de compra por plataforma; hereda color del tema vía `currentColor`.
- **IGDB API v4** — campo `category` renombrado a `game_type`; detección de tienda por dominio de URL en lugar de `external_games.category` (eliminado en v4); filtros `version_parent = null` + `game_type ∈ {0,4,8,9}` para excluir DLCs/mods/ediciones; badge "ya importado" en el diálogo de búsqueda IGDB.
- **Links de tienda en admin** — diálogo con inputs agrupados por plataforma y tienda; botón Sync IGDB (icono SVG) por producto; "Importar últimas 48h" con reporte de importados/omitidos/errores.
