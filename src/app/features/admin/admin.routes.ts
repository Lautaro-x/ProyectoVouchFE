import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'genres', pathMatch: 'full' },
      {
        path: 'genres',
        loadComponent: () => import('./genres/admin-genres.component').then(m => m.AdminGenresComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
      },
      {
        path: 'platforms',
        loadComponent: () => import('./platforms/admin-platforms.component').then(m => m.AdminPlatformsComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./products/admin-products.component').then(m => m.AdminProductsComponent),
      },
      {
        path: 'reviews',
        loadComponent: () => import('./reviews/admin-reviews.component').then(m => m.AdminReviewsComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'surveys',
        loadComponent: () => import('./surveys/admin-surveys.component').then(m => m.AdminSurveysComponent),
      },
      {
        path: 'announcements',
        loadComponent: () => import('./announcements/admin-announcements.component').then(m => m.AdminAnnouncementsComponent),
      },
      {
        path: 'verify-requests',
        loadComponent: () => import('./verify-requests/admin-verify-requests.component').then(m => m.AdminVerifyRequestsComponent),
      },
    ],
  },
];
