import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../home/dashboard/empresa/service/empresa.service';
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

  constructor(
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const tokenData = this.authService.getUserData();
    this.isEmpresa = tokenData?.rol === 'ROLE_EMPRESA';
    this.isUsuario = tokenData?.rol === 'ROLE_USUARIO';
    this.idEntidad = tokenData?.empresa_id ?? tokenData?.id ?? 0;

    if (this.idEntidad) {
      // Establecer fechas por defecto (mes actual)
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      this.fechaInicio = inicioMes.toISOString().split('T')[0];
      this.fechaFin = finMes.toISOString().split('T')[0];

      this.cargarDatos();
    } else {
      console.warn('⚠️ No se encontró id de empresa o usuario en el token');
    }
  }

  /** 🔹 Cargar datos según el rol */
  private cargarDatos(): void {
    if (this.isEmpresa) {
      this.cargarUsuariosActivos();
      this.cargarVentasEmpresa();
      this.cargarGananciaEmpresa();
    } else if (this.isUsuario) {
      this.cargarVentasUsuario();
      this.cargarGananciaUsuario();
    }
  }

  /** 🔹 Empresa: cargar usuarios activos */
  private cargarUsuariosActivos(): void {
    this.empresaService.getUsuariosActivos(this.idEntidad).subscribe({
      next: (total: number) => (this.usuariosActivos = total),
      error: (err: any) => console.error('Error al obtener usuarios activos:', err)
    });
  }

  /** 🔹 Empresa: total vendido entre fechas */
  private cargarVentasEmpresa(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    this.empresaService.getTotalVendidoEntreFechas(this.idEntidad, this.fechaInicio, this.fechaFin).subscribe({
      next: (total: number) => (this.ventasDelMes = total),
      error: (err: any) => console.error('Error al obtener ventas de empresa:', err)
    });
  }

  /** 🔹 Usuario: total vendido entre fechas */
  private cargarVentasUsuario(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    this.usuarioService.getTotalVendidoEntreFechas(this.idEntidad, this.fechaInicio, this.fechaFin).subscribe({
      next: (total: number) => (this.ventasDelMes = total),
      error: (err: any) => console.error('Error al obtener ventas del usuario:', err)
    });
  }

  /** 🔹 Filtrar ventas según fechas */
  filtrarVentasPorFechas(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    if (this.isEmpresa) this.cargarVentasEmpresa();
    else if (this.isUsuario) this.cargarVentasUsuario();
  }

  /** 🔹 Empresa: ganancia total */
  private cargarGananciaEmpresa(): void {
    this.empresaService.getGananciaTotal(this.idEntidad).subscribe({
      next: (data: number) => (this.gananciaTotal = data),
      error: (err: any) => console.error('Error al obtener ganancia de empresa:', err)
    });
  }

  /** 🔹 Usuario: ganancia total */
  private cargarGananciaUsuario(): void {
    this.usuarioService.getGananciaTotal(this.idEntidad).subscribe({
      next: (data: number) => (this.gananciaTotal = data),
      error: (err: any) => console.error('Error al obtener ganancia de usuario:', err)
    });
  }
}
