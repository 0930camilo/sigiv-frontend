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
      { path: 'users',      loadComponent: () => import('../users/page/user/user').then(m => m.User) },
      { path: 'proveedores', loadComponent: () => import('../proveedor/page/proveedor/proveedor').then(m => m.Proveedor) },
      { path: 'categorias', loadComponent: () => import('../categorias/page/categoria/categoria').then(m => m.Categoria) },
      { path: 'productos', loadComponent: () => import('../producto/page/producto/producto').then(m => m.Producto) },
      { path: 'ventas', loadComponent: () => import('../venta/page/venta/venta').then(m => m.VentaComponent) }
    ]
  }
];
