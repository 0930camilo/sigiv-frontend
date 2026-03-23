import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { VentaService } from '../../service/venta-service';
import { Venta } from '../../model/venta.model';
import { FiltrosVentasComponent } from "../filtro/filtro";

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReusableTable,
    FiltrosVentasComponent
  ],
  templateUrl: './venta.html',
  styleUrls: ['./venta.scss']
})
export class VentaComponent implements OnInit {

  ventas: Venta[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;

  empresaId!: number;
  pageSize = 10;
filtroId: number | null = null;


  ventaSeleccionada: Venta | null = null;
  mostrarDetalle = false;

  columns: TableColumn[] = [
    { field: 'idventa', header: 'ID' },
    { field: 'fecha', header: 'Fecha' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Teléfono' },
    { field: 'empresaNombre', header: 'Empresa' }, // ✅ nueva columna
    { field: 'efectivo', header: 'Efectivo', type: 'number' },
    { field: 'cambio', header: 'Cambio', type: 'number' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'nombreUsuario', header: 'Vendedor' },
    {
      field: 'acciones',
      header: 'Detalle',
      type: 'button',
      icon: 'fa-solid fa-eye text-green-600',
      action: (row: Venta) => this.verDetalle(row)
    },
    {
      field: 'factura',
      header: 'Factura',
      type: 'button',
      icon: 'fa-solid fa-file-arrow-down text-blue-600',
      action: (row: Venta) => this.descargarFactura(row.idventa)
    }
  ];

  constructor(
    private ventaService: VentaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.empresaId = Number(this.authService.getEmpresaId());
    this.getVentas(0);
  }

  getVentas(page: number = 0): void {

    if (page < 0 || (this.totalPages && page >= this.totalPages)) {
      return;
    }

    this.loading = true;

    this.ventaService
      .getVentasByEmpresa(this.empresaId, page, this.pageSize, this.filtroId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.ventas = res.data.ventas;
          this.currentPage = res.data.currentPage;
          this.totalPages = res.data.totalPages;
        },
        error: (err) => console.error('Error cargando ventas:', err)
      });
  }

 filtrarPorId(id: number | null) {
    this.filtroId = id;
    this.getVentas(0);
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
  }

  descargarFactura(id: number) {
    this.ventaService.descargarFactura(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
