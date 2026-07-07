import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { AuthService } from '../../../auth/service/auth-service';
import { CotizacionService } from '../../service/cotizacion-service';
import { Cotizacion } from '../../model/cotizacion.model';
import { PosPrintService } from '../../../../shared/services/pos-print.service';

@Component({
  selector: 'app-cotizaciones-usuario',
  standalone: true,
  imports: [RouterModule, CommonModule, ReusableTable],
  templateUrl: './cotizaciones-usuario.html',
  styleUrls: ['./cotizaciones-usuario.scss']
})
export class CotizacionesUsuarioComponent implements OnInit {
  cotizaciones: Cotizacion[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;
  empresaId!: number;
  usuarioId!: number;
  pageSize = 10;

  cotizacionSeleccionada: Cotizacion | null = null;
  mostrarDetalle = false;

  mostrarPreviewPdf = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  pdfIdActual: number | null = null;
  cotizacionActual: Cotizacion | null = null;

  columns: TableColumn[] = [
    { field: 'idcotizacion', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Telefono' },
    { field: 'total', header: 'Total', type: 'number' },
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
    const usuario = this.authService.getUserId();

    if (!empresa || !usuario) {
      console.error('Empresa o usuario no encontrado');
      return;
    }

    this.empresaId = Number(empresa);
    this.usuarioId = Number(usuario);
    this.getCotizaciones(0);
  }

  getCotizaciones(page: number = 0): void {
    if (page < 0 || (this.totalPages && page >= this.totalPages)) return;

    this.loading = true;
    this.cotizacionService
      .getCotizacionesByUsuario(this.empresaId, this.usuarioId, page, this.pageSize)
      .subscribe({
        next: (res) => {
          this.cotizaciones = res.data?.cotizaciones ?? [];
          this.currentPage = res.data?.currentPage ?? 0;
          this.totalPages = res.data?.totalPages ?? 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error cargando cotizaciones del usuario:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  verDetalle(cotizacion: Cotizacion): void {
    this.cotizacionSeleccionada = cotizacion;
    this.mostrarDetalle = true;
    this.cdr.markForCheck();
  }

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
}
