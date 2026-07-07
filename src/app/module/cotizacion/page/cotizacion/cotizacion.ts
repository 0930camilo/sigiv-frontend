import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { CotizacionService } from '../../service/cotizacion-service';
import { Cotizacion } from '../../model/cotizacion.model';
import { PosPrintService } from '../../../../shared/services/pos-print.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-cotizacion',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReusableTable
  ],
  templateUrl: './cotizacion.html',
  styleUrls: ['./cotizacion.scss']
})
export class CotizacionComponent implements OnInit {

  cotizaciones: Cotizacion[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;

  empresaId!: number;
  pageSize = 10;

  // Filtros
  filtroCliente = '';
  filtroFechaInicio = '';
  filtroFechaFin = '';

  // Detalle
  cotizacionSeleccionada: Cotizacion | null = null;
  mostrarDetalle = false;

  // Preview PDF
  mostrarPreviewPdf = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  pdfIdActual: number | null = null;
  cotizacionActual: Cotizacion | null = null;

  columns: TableColumn[] = [
    { field: 'idcotizacion', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Teléfono' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'nombreUsuario', header: 'Vendedor' },
    {
      field: 'acciones',
      header: 'Detalle',
      type: 'button',
      icon: 'fa-solid fa-eye text-green-600',
      action: (row: Cotizacion) => this.verDetalle(row)
    },
    {
      field: 'pdf',
      header: 'PDF',
      type: 'button',
      icon: 'fa-solid fa-file-pdf text-blue-600',
      action: (row: Cotizacion) => this.previewPdf(row.idcotizacion)
    },
    {
      field: 'imprimirPos',
      header: 'POS',
      type: 'button',
      icon: 'fa-solid fa-print text-purple-600',
      action: (row: Cotizacion) => this.imprimirCotizacionPos(row)
    },
    {
      field: 'eliminar',
      header: 'Eliminar',
      type: 'button',
      icon: 'fa-solid fa-trash text-red-600',
      action: (row: Cotizacion) => this.confirmarEliminar(row)
    }
  ];

  constructor(
    private cotizacionService: CotizacionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private posPrintService: PosPrintService
  ) {}

  ngOnInit(): void {
    const empresa = this.authService.getEmpresaId();
    if (!empresa) {
      console.error('Empresa no encontrada');
      return;
    }
    this.empresaId = Number(empresa);
    this.getCotizaciones(0);
  }

  getCotizaciones(page: number = 0): void {
    if (page < 0 || (this.totalPages && page >= this.totalPages)) return;

    this.loading = true;

    const filtros: any = {};
    if (this.filtroCliente.trim()) filtros.nombreCliente = this.filtroCliente.trim();
    if (this.filtroFechaInicio) filtros.fechaInicio = this.formatDateToDDMMYYYY(this.filtroFechaInicio);
    if (this.filtroFechaFin) filtros.fechaFin = this.formatDateToDDMMYYYY(this.filtroFechaFin);

    this.cotizacionService
      .getCotizacionesByEmpresa(this.empresaId, page, this.pageSize, filtros)
      .subscribe({
        next: (res) => {
          this.cotizaciones = res.data?.cotizaciones ?? [];
          this.currentPage = res.data?.currentPage ?? 0;
          this.totalPages = res.data?.totalPages ?? 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error cargando cotizaciones:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  buscar(): void {
    this.getCotizaciones(0);
  }

  limpiarFiltros(): void {
    this.filtroCliente = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.getCotizaciones(0);
  }

  verDetalle(cotizacion: Cotizacion): void {
    this.cotizacionSeleccionada = cotizacion;
    this.mostrarDetalle = true;
    this.cdr.markForCheck();
  }

  confirmarEliminar(cotizacion: Cotizacion): void {
    Swal.fire({
      title: '¿Eliminar cotización?',
      text: `Se eliminará la cotización #${cotizacion.idcotizacion} de ${cotizacion.nombreCliente}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarCotizacion(cotizacion.idcotizacion);
      }
    });
  }

  eliminarCotizacion(id: number): void {
    this.cotizacionService.eliminarCotizacion(id).subscribe({
      next: () => {
        Swal.fire('Eliminada', 'La cotización fue eliminada correctamente', 'success');
        this.getCotizaciones(this.currentPage);
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo eliminar la cotización', 'error');
        console.error(err);
      }
    });
  }

  // ================================
  // PREVIEW PDF
  // ================================
  previewPdf(id: number): void {
    this.cotizacionActual =
      this.cotizaciones.find((cotizacion) => cotizacion.idcotizacion === id) ?? null;

    this.cotizacionService.descargarCotizacionPdf(id).subscribe({
      next: (blob) => {
        this.pdfBlob = blob;
        this.pdfIdActual = id;
        const url = window.URL.createObjectURL(blob);
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.mostrarPreviewPdf = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando PDF:', err);
        Swal.fire('Error', 'No se pudo cargar el PDF de la cotización', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  descargarPdfDesdePreview(): void {
    if (!this.pdfBlob || !this.pdfIdActual) return;
    const url = window.URL.createObjectURL(this.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizacion-${this.pdfIdActual}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  imprimirCotizacionPos(cotizacion: Cotizacion | null = this.cotizacionActual): void {
    if (!cotizacion) return;

    this.posPrintService.imprimir({
      tipo: 'COTIZACION',
      numero: cotizacion.idcotizacion,
      fecha: cotizacion.fecha,
      nombreCliente: cotizacion.nombreCliente,
      telefonoCliente: cotizacion.telefonoCliente,
      nombreUsuario: cotizacion.nombreUsuario,
      total: cotizacion.total,
      detalles: cotizacion.detalles ?? []
    });
  }

  cerrarPreviewPdf(): void {
    this.mostrarPreviewPdf = false;
    this.pdfPreviewUrl = null;
    this.pdfBlob = null;
    this.pdfIdActual = null;
    this.cotizacionActual = null;
    this.cdr.markForCheck();
  }

  // Convierte YYYY-MM-DD (del input date) a DD/MM/YYYY (formato del backend)
  private formatDateToDDMMYYYY(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
