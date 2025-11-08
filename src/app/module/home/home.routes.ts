import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const HOME_ROUTES: Routes = [
{
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'analytics', loadComponent: () => import('./page/analytics/analytics').then(m => m.Analytics) },
      { path: 'ecommerce', loadComponent: () => import('./page/ecommerce/ecommerce').then(m => m.Ecommerce) },
      { path: 'users',      loadComponent: () => import('../users/page/user/user').then(m => m.User)}
    ]
  }
];
