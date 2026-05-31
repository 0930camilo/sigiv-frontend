import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const HOME_ROUTES: Routes = [
{
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      { path: 'perfil', loadComponent: () => import('../empresa/page/perfil/perfil').then(m => m.PerfilEmpresaComponent) },
      { path: 'perfil-usuario', loadComponent: () => import('../users/page/perfil/perfil').then(m => m.PerfilUsuarioComponent) },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'users',      loadComponent: () => import('../users/page/user/user').then(m => m.User) },
      { path: 'proveedores', loadComponent: () => import('../proveedor/page/proveedor/proveedor').then(m => m.Proveedor) },
      { path: 'categorias', loadComponent: () => import('../categorias/page/categoria/categoria').then(m => m.CategoriaComponent) },
      { path: 'productos', loadComponent: () => import('../producto/page/producto/producto').then(m => m.Producto) },
      { path: 'ventas', loadComponent: () => import('../venta/page/venta/venta').then(m => m.VentaComponent) },
      { path: 'registrar-venta', loadComponent: () => import('../venta/page/registrar-venta/registrar-venta').then(m => m.RegistrarVentaComponent) },
      { path: 'cotizaciones', loadComponent: () => import('../cotizacion/page/cotizacion/cotizacion').then(m => m.CotizacionComponent) },
      { path: 'registrar-cotizacion', loadComponent: () => import('../cotizacion/page/registrar-cotizacion/registrar-cotizacion').then(m => m.RegistrarCotizacionComponent) },
      { path: 'devoluciones', loadComponent: () => import('../devoluciones/page/devolucion/devolucion').then(m => m.DevolucionComponent) },
      { path: 'registrar-devolucion', loadComponent: () => import('../devoluciones/page/registrar-devolucion/registrar-devolucion').then(m => m.RegistrarDevolucionComponent) },
      { path: 'personas', loadComponent: () => import('../persona/page/persona/persona').then(m => m.PersonaComponent) },
      { path: 'nominas', loadComponent: () => import('../nomina/page/nomina/nomina').then(m => m.NominaComponent) },
      { path: 'mis-ventas', loadComponent: () => import('../venta/page/ventas-usuario/ventas-usuario').then(m => m.VentasUsuarioComponent) },
      { path: 'mis-cotizaciones', loadComponent: () => import('../cotizacion/page/cotizaciones-usuario/cotizaciones-usuario').then(m => m.CotizacionesUsuarioComponent) },
      { path: 'mis-devoluciones', loadComponent: () => import('../devoluciones/page/devoluciones-usuario/devoluciones-usuario').then(m => m.DevolucionesUsuarioComponent) }
    ]
  }
];
