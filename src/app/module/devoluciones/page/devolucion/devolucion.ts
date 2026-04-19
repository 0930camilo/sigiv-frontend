import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { DevolucionService } from '../../service/devolucion-service';
import { DevolucionResponse } from '../../model/devolucion.model';
import { AuthService } from '../../../auth/service/auth-service';

@Component({
  selector: 'app-devolucion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReusableTable],
  templateUrl: './devolucion.html',
  styleUrls: ['./devolucion.scss']
})
export class DevolucionComponent implements OnInit {

  devoluciones: DevolucionResponse[] = [];
  loading = false;
  ventaIdBuscar: number | null = null;
  ventaBuscada = false;
  empresaId: number | null = null;
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
    this.empresaId = this.authService.getEmpresaId();
    this.cargarDevoluciones();
  }

  cargarDevoluciones(page: number = 0): void {
    if (!this.empresaId) return;
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;
    this.loading = true;
    this.ventaBuscada = true;

    this.devolucionService.listarPorEmpresa(this.empresaId, page, this.pageSize).subscribe({
      next: (res) => {
        this.devoluciones = Array.isArray(res.data?.devoluciones) ? res.data.devoluciones : [];
        this.currentPage = res.data?.currentPage ?? 0;
        this.totalPages = res.data?.totalPages ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando devoluciones:', err);
        this.devoluciones = [];
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No se pudieron cargar las devoluciones', 'error');
      }
    });
  }

  buscar(): void {
    if (!this.empresaId) return;

    this.loading = true;
    this.ventaBuscada = true;

    this.devolucionService.listarPorEmpresa(this.empresaId, 0, this.pageSize, this.ventaIdBuscar).subscribe({
      next: (res) => {
        this.devoluciones = Array.isArray(res.data?.devoluciones) ? res.data.devoluciones : [];
        this.currentPage = res.data?.currentPage ?? 0;
        this.totalPages = res.data?.totalPages ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando devoluciones:', err);
        this.devoluciones = [];
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No se pudieron cargar las devoluciones', 'error');
      }
    });
  }

  limpiar(): void {
    this.ventaIdBuscar = null;
    this.cargarDevoluciones();
  }
}
