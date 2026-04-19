import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layout/user-layout.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/user-profile.component').then(m => m.UserProfileComponent),
      },
      {
        path: 'consents',
        loadComponent: () =>
          import('./consents/user-consents.component').then(m => m.UserConsentsComponent),
      },
      {
        path: 'public-profile',
        loadComponent: () =>
          import('./public-profile/user-public-profile.component').then(m => m.UserPublicProfileComponent),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./reviews/user-reviews.component').then(m => m.UserReviewsComponent),
      },
      {
        path: 'badges',
        loadComponent: () =>
          import('./badges/user-badges.component').then(m => m.UserBadgesComponent),
      },
    ],
  },
];
