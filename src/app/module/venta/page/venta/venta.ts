import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { VentaService } from '../../service/venta-service';
import { Venta } from '../../model/venta.model';
import { FiltrosVentasComponent } from '../filtro/filtro';

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

  // 🔥 filtro
  filtroId: number | null = null;

  // 🔥 detalle
  ventaSeleccionada: Venta | null = null;
  mostrarDetalle = false;

  // 📄 preview factura
  mostrarPreviewFactura = false;
  facturaPreviewUrl: SafeResourceUrl | null = null;
  facturaBlob: Blob | null = null;
  facturaIdActual: number | null = null;

  columns: TableColumn[] = [
    { field: 'idventa', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Teléfono' },
    { field: 'empresaNombre', header: 'Empresa' },
    { field: 'efectivo', header: 'Efectivo', type: 'number' },
    { field: 'cambio', header: 'Cambio', type: 'number' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'nombreUsuario', header: 'Vendedor' },

    // 👁 VER DETALLE
    {
      field: 'acciones',
      header: 'Detalle',
      type: 'button',
      icon: 'fa-solid fa-eye text-green-600',
      action: (row: Venta) => this.verDetalle(row)
    },

    // 📄 VER FACTURA (preview)
    {
      field: 'factura',
      header: 'Factura',
      type: 'button',
      icon: 'fa-solid fa-file-invoice text-blue-600',
      action: (row: Venta) => this.previewFactura(row.idventa)
    }
  ];

  constructor(
    private ventaService: VentaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  // ===============================
  // INIT
  // ===============================
  ngOnInit(): void {
    const empresa = this.authService.getEmpresaId();

    if (!empresa) {
      console.error('Empresa no encontrada');
      return;
    }

    this.empresaId = Number(empresa);
    this.getVentas(0);
  }

  // ===============================
  // OBTENER VENTAS
  // ===============================
  getVentas(page: number = 0): void {

    // 🚫 evitar páginas inválidas
    if (page < 0 || (this.totalPages && page >= this.totalPages)) {
      return;
    }

    this.loading = true;

    this.ventaService
      .getVentasByEmpresa(
        this.empresaId,
        page,
        this.pageSize,
        this.filtroId
      )
      .subscribe({
        next: (res) => {
          this.ventas = res.data?.ventas ?? [];
          this.currentPage = res.data?.currentPage ?? 0;
          this.totalPages = res.data?.totalPages ?? 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error cargando ventas:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  // ===============================
  // FILTRO POR ID 🔥
  // ===============================
  filtrarPorId(id: number | null): void {
    this.filtroId = id;
    this.getVentas(0); // 🔥 reinicia paginación
  }

  // ===============================
  // VER DETALLE
  // ===============================
  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
    this.cdr.markForCheck();
  }

  // ===============================
  // PREVIEW FACTURA PDF
  // ===============================
  previewFactura(id: number): void {
    this.ventaService.descargarFactura(id).subscribe({
      next: (blob) => {
        this.facturaBlob = blob;
        this.facturaIdActual = id;
        const url = window.URL.createObjectURL(blob);
        this.facturaPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.mostrarPreviewFactura = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando factura:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // ===============================
  // DESCARGAR FACTURA DESDE PREVIEW
  // ===============================
  descargarFacturaDesdePreview(): void {
    if (!this.facturaBlob || !this.facturaIdActual) return;

    const url = window.URL.createObjectURL(this.facturaBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${this.facturaIdActual}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ===============================
  // CERRAR PREVIEW FACTURA
  // ===============================
  cerrarPreviewFactura(): void {
    this.mostrarPreviewFactura = false;
    this.facturaPreviewUrl = null;
    this.facturaBlob = null;
    this.facturaIdActual = null;
    this.cdr.markForCheck();
  }

}
