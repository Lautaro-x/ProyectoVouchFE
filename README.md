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
│   │   │   ├── auth.guard.ts          # Protege rutas privadas
│   │   │   └── admin.guard.ts         # Protege /administration (role === 'admin')
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
│   │   ├── landing/                   # Página de inicio
│   │   └── admin/                     # Panel de administración (/administration)
│   │       ├── layout/                # Shell con sidebar
│   │       ├── genres/                # CRUD Géneros + asignación de categorías
│   │       ├── categories/            # CRUD Categorías
│   │       ├── platforms/             # CRUD Plataformas
│   │       ├── products/              # CRUD Productos + búsqueda IGDB
│   │       ├── reviews/               # Gestión de reseñas (banear/desbanear)
│   │       ├── users/                 # Gestión de usuarios (banear/desbanear, roles)
│   │       ├── models/
│   │       │   └── admin.models.ts    # Interfaces TypeScript del panel
│   │       ├── pipes/
│   │       │   └── localized-name.pipe.ts  # Pipe para mostrar nombres traducibles en el locale activo
│   │       ├── services/
│   │       │   └── admin-api.service.ts  # Métodos tipados para todos los endpoints admin
│   │       ├── admin.routes.ts
│   │       └── admin-shared.css       # Estilos compartidos del panel
│   ├── shared/                        # Componentes reutilizables
│   │   └── components/
│   │       ├── header/                # Cabecera global con nav y auth
│   │       ├── lang-switcher/         # Selector de idioma
│   │       └── dialog/                # Diálogo modal genérico (confirmaciones)
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

### Panel de administración (`/administration`)

Ruta oculta, no enlazada en ningún menú. Accesible sólo escribiendo la URL directamente. Protegida por `AdminGuard`.

**Decisión de arquitectura:** La ruta no aparece en ningún menú de navegación. El acceso requiere conocer la URL y tener el rol `admin`. No hay flujo de login separado — usa el mismo login de Google que el resto de la app.

#### AdminGuard (`src/app/core/guards/admin.guard.ts`)
`CanActivateFn` que lee `currentUser()` del servicio de auth. Redirige a `/` si el usuario no está autenticado o no tiene `role === 'admin'`.

#### Admin Layout (`features/admin/layout/`)
Shell del panel: sidebar de navegación fija + `<router-outlet>`. Todas las secciones cargan de forma lazy. El logo "VOUCH admin" es un enlace (`<a routerLink="/">`) que lleva a la landing.

**Header condicional:** El `<app-header>` global se omite en todas las rutas bajo `/administration`. `App` usa `toSignal(router.events)` para derivar un signal `isAdmin` que detecta si la URL actual empieza por `/administration`. Esto evita duplicar cabeceras en el panel, que tiene su propio sidebar como navegación principal.

#### AdminApiService (`features/admin/services/admin-api.service.ts`)
Servicio centralizado con métodos tipados para todos los endpoints admin del backend. Devuelve `Observable<T>` usando `HttpClient`.

#### Modelos TypeScript (`features/admin/models/admin.models.ts`)
Interfaces que mapean la forma de los datos del backend:
`Genre`, `Category`, `CategoryWithWeight`, `Platform`, `Product`, `GameDetail`, `AdminReview`, `AdminUser`, `Paginated<T>`, `IgdbGame`.

El tipo `TranslatableName = Record<string, string>` representa los campos de nombre multilingüe que el backend devuelve como objeto JSON con los 5 idiomas (`en`, `es`, `fr`, `pt`, `it`). Los interfaces `Genre` y `Category` usan este tipo para su campo `name`.

#### LocalizedNamePipe (`features/admin/pipes/localized-name.pipe.ts`)
Pipe `pure: false` que recibe un `TranslatableName` y devuelve el valor en el locale activo según `TranslocoService.getActiveLang()`, con fallback a `en`. Al ser `pure: false`, reacciona al cambio de idioma sin recargar la página.

```html
{{ item.name | localizedName }}
```

Usado en las tablas de Géneros, Categorías y en los selectores y tabla de Productos.

#### CSS compartido (`features/admin/admin-shared.css`)
Hoja de estilos común importada por todos los componentes de sección vía `@import '../admin-shared.css'`. Define: table, form-card, form-grid, field, btn-primary, btn-ghost, btn-sm, badge, pagination, section-header, igdb-search, igdb-results, igdb-card.

#### Secciones del panel

**Géneros** — CRUD + gestión de categorías con pesos por género. Sólo muestra las categorías asignadas; el dropdown lista las disponibles (no asignadas). Confirmación vía `DialogComponent` antes de añadir o quitar. El formulario de creación/edición expone un campo de texto por cada uno de los 5 idiomas.

**Categorías** — CRUD con formulario multilingüe (5 idiomas). El slug se genera en el backend a partir del nombre en inglés.

**Plataformas** — CRUD con tipo (`console | pc | streaming`).

**Productos** — Listado paginado, CRUD con campos `GameDetails` embebidos, búsqueda en IGDB con miniatura e importación directa con un click.

**Reseñas** — Listado paginado, filtro por baneadas, banear con motivo / desbanear. Texto truncado a 60 caracteres con `SlicePipe`.

**Usuarios** — Listado paginado, filtros por estado y rol, cambio de rol inline, banear con motivo / desbanear. Texto truncado con `SlicePipe`.

---

### DialogComponent (`src/app/shared/components/dialog/`)

Componente modal reutilizable. El contenido se proyecta vía `<ng-content>`, por lo que sirve para cualquier tipo de acción: confirmaciones, formularios, información.

**API:**

| Input/Output | Tipo | Descripción |
|---|---|---|
| `title` | `input<string>('')` | Título del diálogo |
| `subtitle` | `input<string>('')` | Subtítulo descriptivo (opcional) |
| `isOpen` | `input<boolean>(false)` | Controla visibilidad |
| `(closed)` | `output<void>` | Emitido al cerrar (X, Escape, clic backdrop) |

**Cierre automático:** `@HostListener('document:keydown.escape')` y clic sobre `.dialog-backdrop`.

**Uso:**
```html
<app-dialog
  [title]="dialogTitle()"
  [subtitle]="dialogSubtitle()"
  [isOpen]="dialogOpen()"
  (closed)="closeDialog()"
>
  <div class="form-actions">
    <button class="btn-primary" (click)="confirmDialog()">Confirmar</button>
    <button class="btn-ghost" (click)="closeDialog()">Cancelar</button>
  </div>
</app-dialog>
```

**Patrón de integración con acción pendiente:** El componente anfitrión guarda la acción como `signal<(() => void) | null>`. Al confirmar, ejecuta la función y cierra el diálogo. Esto evita duplicar lógica de confirmación para cada operación.

---

## Convenciones

- Todos los componentes son **standalone** (sin NgModules)
- Estado reactivo con **Angular Signals** (`signal`, `computed`, `input()`, `output()`)
- Sin comentarios en el código
- Sin `ngModel` — se usa property binding + event binding manual
- `SlicePipe` y demás pipes de `@angular/common` se importan explícitamente en cada componente que los usa

---

## Roadmap

### Fase 1 — Core y Admin (completada)
- [x] Estructura base (standalone components, lazy routes, SSR)
- [x] Auth con Google Identity Services + Sanctum
- [x] i18n con Transloco (5 idiomas, detección automática)
- [x] Panel de administración (`/administration`) con AdminGuard
- [x] CRUD Géneros con asignación de categorías y pesos
- [x] CRUD Categorías, Plataformas, Productos
- [x] Gestión de Reseñas y Usuarios (banear/desbanear, roles)
- [x] Importación de juegos desde IGDB
- [x] DialogComponent reutilizable para confirmaciones
- [x] Nombres de géneros y categorías multilingüe (`TranslatableName`, `LocalizedNamePipe`)

### Fase 2 — Pública
- [ ] Listado de productos con triple score (Global, Pro, Trust)
- [ ] Detalle de producto con reseñas
- [ ] Formulario de reseña (scores por categoría)
- [ ] Trust Score en tiempo real

### Fase 3 — Capa social
- [ ] Perfil de usuario
- [ ] Sistema de Follow
- [ ] Feed de actividad

### Fase 4 — Optimización y SEO
- [ ] Meta tags dinámicos por producto (OpenGraph)
- [ ] Sitemap dinámico
- [ ] Widget para streamers (OBS)
- [ ] Generador de infografías para redes sociales
