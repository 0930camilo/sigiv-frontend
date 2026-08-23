import { Routes } from '@angular/router';
import { RoutesEnum } from './shared/enums/routes.enum';
import { AuthGuard } from './core/guards/authGuard';
import { LoginGuard } from './core/guards/LoginGuard';

export const routes: Routes = [

  // =========================
  // LANDING
  // =========================
  {
    path: RoutesEnum.LANDING,
    pathMatch: 'full',
    loadComponent: () =>
      import('./module/landing/landing')
        .then(m => m.Landing)
  },

  // =========================
  // AUTH
  // =========================
  {
    path: RoutesEnum.AUTH_LOGIN,
    canActivate: [LoginGuard],
    loadComponent: () =>
      import('./module/auth/page/login/login')
        .then(m => m.Login)
  },

  {
    path: RoutesEnum.AUTH_REGISTER,
    canActivate: [LoginGuard],
    loadComponent: () =>
      import('./module/auth/page/register/register')
        .then(m => m.Register)
  },

  // =========================
  // LEGAL
  // =========================
  {
    path: 'legal/politica-privacidad',
    loadComponent: () =>
      import('./module/landing/legal/politica-privacidad/politica-privacidad')
        .then(m => m.PoliticaPrivacidad)
  },

  {
    path: 'legal/terminos-condiciones',
    loadComponent: () =>
      import('./module/landing/legal/terminos-condiciones/terminos-condiciones')
        .then(m => m.TerminosCondiciones)
  },

  {
    path: 'legal/politica-cookies',
    loadComponent: () =>
      import('./module/landing/legal/politica-cookies/politica-cookies')
        .then(m => m.PoliticaCookies)
  },

  // =========================
  // HOME
  // =========================
  {
    path: RoutesEnum.HOME,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./module/home/home.routes')
        .then(m => m.HOME_ROUTES)
  },

  // =========================
  // 404
  // =========================
  {
    path: '**',
    redirectTo: ''
  }
];
