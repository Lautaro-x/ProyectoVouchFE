import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'games/upcoming',
    loadComponent: () =>
      import('./features/upcoming/upcoming.component').then(m => m.UpcomingComponent),
  },
  {
    path: 'administration',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/user/user.routes').then(m => m.userRoutes),
  },
  {
    path: 'games',
    loadComponent: () =>
      import('./features/games/game-list/game-list.component').then(m => m.GameListComponent),
  },
  {
    path: 'games/:filterType/:filterValue',
    loadComponent: () =>
      import('./features/games/game-list/game-list.component').then(m => m.GameListComponent),
  },
  {
    path: 'review/new/:productId',
    loadComponent: () =>
      import('./features/review-create/review-create.component').then(m => m.ReviewCreateComponent),
  },
  {
    path: 'review/edit/:reviewId',
    loadComponent: () =>
      import('./features/review-edit/review-edit.component').then(m => m.ReviewEditComponent),
  },
  {
    path: 'product/:type/:slug',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
  {
    path: 'u/:id',
    loadComponent: () =>
      import('./features/public-profile/public-profile.component').then(m => m.PublicProfileComponent),
  },
  {
    path: 'card/big/:id',
    loadComponent: () =>
      import('./features/public-card/big-card-page/big-card-page.component').then(m => m.BigCardPageComponent),
  },
  {
    path: 'card/mid/:id',
    loadComponent: () =>
      import('./features/public-card/mid-card-page/mid-card-page.component').then(m => m.MidCardPageComponent),
  },
  {
    path: 'card/mini/:id',
    loadComponent: () =>
      import('./features/public-card/mini-card-page/mini-card-page.component').then(m => m.MiniCardPageComponent),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
