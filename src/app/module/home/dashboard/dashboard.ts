import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmpresaService, ResumenVendedor } from '../../home/dashboard/empresa/service/empresa.service';
import { UsuarioService } from '../../home/dashboard/usuario/service/usuario.service';
import { AuthService } from '../../auth/service/auth-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  usuariosActivos = 0;
  ventasDelMes = 0;
  gananciaTotal = 0;
  idEntidad = 0; // Puede ser empresa o usuario
  isEmpresa = false;
  isUsuario = false;

  // 🗓️ Variables para el rango de fechas
  fechaInicio = '';
  fechaFin = '';

  // 📊 Resumen por vendedor
  resumenVendedores: ResumenVendedor[] = [];

  constructor(
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const tokenData = this.authService.getUserData();
    this.isEmpresa = tokenData?.rol === 'ROLE_EMPRESA';
    this.isUsuario = tokenData?.rol === 'ROLE_USUARIO';

    if (this.isEmpresa) {
      this.idEntidad = tokenData?.empresa_id ?? tokenData?.id ?? 0;
    } else if (this.isUsuario) {
      this.idEntidad = tokenData?.id ?? 0;
    }

    if (this.idEntidad) {
      // Establecer fechas por defecto (mes actual)
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      this.fechaInicio = `${inicioMes.getFullYear()}-${String(inicioMes.getMonth() + 1).padStart(2, '0')}-${String(inicioMes.getDate()).padStart(2, '0')}`;
      this.fechaFin = `${finMes.getFullYear()}-${String(finMes.getMonth() + 1).padStart(2, '0')}-${String(finMes.getDate()).padStart(2, '0')}`;

      this.cargarDatos();
    } else {
      console.warn('⚠️ No se encontró id de empresa o usuario en el token');
    }
  }

  /** 🔹 Cargar datos según el rol */
  private cargarDatos(): void {
    if (this.isEmpresa) {
      this.cargarUsuariosActivos();
      this.cargarDatosEmpresa();
    } else if (this.isUsuario) {
      this.cargarDatosUsuario();
    }
  }

  /** 🔹 Empresa: cargar usuarios activos */
  private cargarUsuariosActivos(): void {
    this.empresaService.getUsuariosActivos(this.idEntidad).subscribe({
      next: (total: number) => {
        this.usuariosActivos = total;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Error al obtener usuarios activos:', err)
    });
  }

  /** 🔹 Empresa: cargar ventas + ganancia + resumen vendedores en paralelo */
  private cargarDatosEmpresa(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    forkJoin({
      ventas: this.empresaService.getTotalVendidoEntreFechas(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ventas empresa:', err); return of(0); })
      ),
      ganancia: this.empresaService.getGananciaTotal(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ganancia empresa:', err); return of(0); })
      ),
      resumen: this.empresaService.getResumenVendedores(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error resumen vendedores:', err); return of([] as ResumenVendedor[]); })
      )
    }).subscribe(({ ventas, ganancia, resumen }) => {
      this.ventasDelMes = ventas;
      this.gananciaTotal = ganancia;
      this.resumenVendedores = resumen;
      this.cdr.markForCheck();
    });
  }

  /** 🔹 Usuario: cargar ventas + ganancia en paralelo */
  private cargarDatosUsuario(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    forkJoin({
      ventas: this.usuarioService.getTotalVendidoEntreFechas(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ventas usuario:', err); return of(0); })
      ),
      ganancia: this.usuarioService.getGananciaTotal(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ganancia usuario:', err); return of(0); })
      )
    }).subscribe(({ ventas, ganancia }) => {
      this.ventasDelMes = ventas;
      this.gananciaTotal = ganancia;
      this.cdr.markForCheck();
    });
  }

  /** 🔹 Filtrar ventas según fechas */
  filtrarVentasPorFechas(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    if (this.isEmpresa) this.cargarDatosEmpresa();
    else if (this.isUsuario) this.cargarDatosUsuario();
  }
}
