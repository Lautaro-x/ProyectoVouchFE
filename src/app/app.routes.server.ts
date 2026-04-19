import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'not-found', renderMode: RenderMode.Prerender },
  { path: 'games', renderMode: RenderMode.Server },
  { path: 'product/:type/:slug', renderMode: RenderMode.Server },
  { path: 'u/:id', renderMode: RenderMode.Server },
  { path: 'card/big/:id', renderMode: RenderMode.Server },
  { path: 'card/mid/:id', renderMode: RenderMode.Server },
  { path: 'card/mini/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
