import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule, RouterOutlet } from "@angular/router";
import { TokenPayload } from '../../auth/model/auth.model';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/service/auth-service';
import { Loaderservice } from '../../../core/services/loaderservice';
import { CommonModule } from '@angular/common';
import { InternalLoader } from '../../../core/services/internal-loader/internal-loader';
import { EmpresaService } from '../../home/dashboard/empresa/service/empresa.service';
import { UsuarioService } from '../../home/dashboard/usuario/service/usuario.service';
import { VentaNotificacionService } from '../../../shared/services/venta-notificacion.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Layout implements OnInit, OnDestroy {
  userData: TokenPayload | null = null;
  isEmpresa = false;
  isUsuario = false;
  internalLoading = false;
  totalDelDia = 0;
  isSidebarOpen = false;
  menuOpen: Record<string, boolean> = {
    inventario: false,
    ventas: false,
    cotizaciones: false,
    devoluciones: false,
    nomina: false
  };
  private destroy$ = new Subject<void>();
  private loadingTimeout: any = null;
  private isFirstLoad = true;

  constructor(
    private authService: AuthService,
    private loader: Loaderservice,
    private router: Router,
    private internalLoader: InternalLoader,
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService,
    private ventaNotificacion: VentaNotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.setupInternalLoader();
    this.openMenuForCurrentRoute(this.router.url);
    this.ventaNotificacion.onVentaRegistrada$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarTotalDelDia());

    // Fallback: si la carga inicial no disparó el total, reintentamos
    setTimeout(() => {
      if (this.totalDelDia === 0 && this.userData) {
        this.cargarTotalDelDia();
      }
    }, 1000);
  }

  ngAfterViewInit(): void {
    if (this.isFirstLoad) {
      setTimeout(() => {
        this.internalLoader.hide();
        this.isFirstLoad = false;
        this.cdr.detectChanges();
      }, 200);
    }
  }

  private setupInternalLoader(): void {
    this.internalLoader.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.internalLoading = value;
        this.cdr.detectChanges();
      });

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event =>
          event instanceof NavigationStart ||
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        )
      )
      .subscribe(event => {
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }

        if (event instanceof NavigationStart && !this.isFirstLoad) {
          this.internalLoader.show();
        } else if (event instanceof NavigationEnd && !this.isFirstLoad) {
          this.loadingTimeout = setTimeout(() => this.internalLoader.hide(), 100);
        } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
          this.internalLoader.hide();
        }
        if (event instanceof NavigationEnd) {
          this.openMenuForCurrentRoute(event.urlAfterRedirects);
          this.isSidebarOpen = false;
        }
        this.cdr.detectChanges();
      });
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.setUserData(user);
        } else {
          const decoded = this.authService.getUserData();
          if (decoded) {
            this.setUserData(decoded);
          }
        }
        this.cdr.detectChanges();
      });
  }

  private setUserData(user: TokenPayload): void {
    this.userData = user;
    this.isEmpresa = user.rol === 'ROLE_EMPRESA';
    this.isUsuario = user.rol === 'ROLE_USUARIO';
    this.cargarTotalDelDia();
  }

  /** 🔹 Cargar total vendido del día */
  private cargarTotalDelDia(): void {
    if (!this.userData) return;
    const now = new Date();
    const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (this.isEmpresa) {
      const id = this.userData.empresa_id ?? this.userData.id;
      this.empresaService.getTotalVendidoEntreFechas(id, hoy, hoy).subscribe({
        next: (total: number) => {
          this.totalDelDia = total;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('❌ Error al obtener total del día (empresa):', err)
      });
    }

    if (this.isUsuario) {
      const id = this.userData.id;
      this.usuarioService.getTotalVendidoEntreFechas(id, hoy, hoy).subscribe({
        next: (total: number) => {
          this.totalDelDia = total;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('❌ Error al obtener total del día (usuario):', err)
      });
    }
  }

  logout(): void {
    this.loader.show();
    setTimeout(() => {
      this.authService.logout();
      this.loader.hide();
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserName(): string {
    return this.isEmpresa
      ? this.userData?.nombre_empresa || 'Empresa'
      : this.userData?.nombre || 'Usuario';
  }

  getPanelTitle(): string {
    return this.isEmpresa ? 'Panel de Empresa' : 'Panel de Usuario';
  }

  toggleMenu(section: string): void {
    this.menuOpen[section] = !this.menuOpen[section];
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  private openMenuForCurrentRoute(url: string): void {
    this.menuOpen['ventas'] =
      url.includes('/ventas') ||
      url.includes('/mis-ventas') ||
      url.includes('/registrar-venta');
    this.menuOpen['cotizaciones'] =
      url.includes('/cotizaciones') ||
      url.includes('/mis-cotizaciones') ||
      url.includes('/registrar-cotizacion');
    this.menuOpen['devoluciones'] =
      url.includes('/devoluciones') ||
      url.includes('/mis-devoluciones') ||
      url.includes('/registrar-devolucion');
    this.menuOpen['inventario'] =
      url.includes('/proveedores') ||
      url.includes('/categorias') ||
      url.includes('/productos');
    this.menuOpen['nomina'] =
      url.includes('/personas') ||
      url.includes('/nominas');
  }
}
