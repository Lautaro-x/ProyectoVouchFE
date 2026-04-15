import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

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
    path: 'administration',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'games',
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
    path: '**',
    redirectTo: '',
  },
];
