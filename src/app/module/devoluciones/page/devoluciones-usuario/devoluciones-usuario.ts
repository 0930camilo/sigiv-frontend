import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { AuthService } from '../../../auth/service/auth-service';
import { DevolucionService } from '../../service/devolucion-service';
import { DevolucionResponse } from '../../model/devolucion.model';

@Component({
  selector: 'app-devoluciones-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReusableTable],
  templateUrl: './devoluciones-usuario.html',
  styleUrls: ['./devoluciones-usuario.scss']
})
export class DevolucionesUsuarioComponent implements OnInit {
  devoluciones: DevolucionResponse[] = [];
  loading = false;
  ventaIdBuscar: number | null = null;
  ventaBuscada = false;
  empresaId!: number;
  usuarioId!: number;
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  columns: TableColumn[] = [
    { field: 'iddevolucion', header: 'ID' },
    { field: 'ventaId', header: 'Venta ID' },
    { field: 'nombreProducto', header: 'Producto' },
    { field: 'cantidad', header: 'Cantidad', type: 'number' },
    { field: 'motivo', header: 'Motivo' },
    { field: 'fecha', header: 'Fecha', type: 'date' }
  ];

  constructor(
    private devolucionService: DevolucionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const empresa = this.authService.getEmpresaId();
    const usuario = this.authService.getUserId();

    if (!empresa || !usuario) {
      console.error('Empresa o usuario no encontrado');
      return;
    }

    this.empresaId = Number(empresa);
    this.usuarioId = Number(usuario);
    this.cargarDevoluciones();
  }

  cargarDevoluciones(page: number = 0): void {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;

    this.loading = true;
    this.ventaBuscada = true;

    this.devolucionService
      .listarPorUsuario(this.empresaId, this.usuarioId, page, this.pageSize, this.ventaIdBuscar)
      .subscribe({
        next: (res) => {
          this.devoluciones = Array.isArray(res.data?.devoluciones) ? res.data.devoluciones : [];
          this.currentPage = res.data?.currentPage ?? 0;
          this.totalPages = res.data?.totalPages ?? 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando devoluciones del usuario:', err);
          this.devoluciones = [];
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  buscar(): void {
    this.cargarDevoluciones(0);
  }

  limpiar(): void {
    this.ventaIdBuscar = null;
    this.cargarDevoluciones(0);
  }
}
