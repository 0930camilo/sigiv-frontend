import { Routes } from '@angular/router';
import { RoutesEnum } from './shared/enums/routes.enum';
import { AuthGuard } from './core/guards/authGuard';
import { LoginGuard } from './core/guards/LoginGuard';

export const routes: Routes = [
  {
    path: RoutesEnum.LANDING,
    pathMatch: 'full',
    loadComponent: () => import('./module/landing/landing').then(m => m.Landing)
  },
  {
    path: RoutesEnum.AUTH_LOGIN,
    canActivate: [LoginGuard],
    loadComponent: () => import('./module/auth/page/login/login').then(m => m.Login)
  },
  {
    path: RoutesEnum.HOME,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./module/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: '**',
    redirectTo: '',
  }
];
