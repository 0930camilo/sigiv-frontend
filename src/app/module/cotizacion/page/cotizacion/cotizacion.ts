import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { CotizacionService } from '../../service/cotizacion-service';
import { Cotizacion } from '../../model/cotizacion.model';

import { FiltrosCotizacionesComponent, FiltrosCotizacion } from '../filtro/filtro';
import Swal from 'sweetalert2';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';



@Component({
  selector: 'app-cotizacion',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReusableTable,
    FiltrosCotizacionesComponent
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
  filtros: FiltrosCotizacion = {};

  // Detalle
  cotizacionSeleccionada: Cotizacion | null = null;
  mostrarDetalle = false;

  // Estado movil
  isMobile = false;

  // Preview PDF
  mostrarPreviewPdf = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  pdfIdActual: number | null = null;
  cotizacionActual: Cotizacion | null = null;

  columns: TableColumn[] = [];
  columnsDesktop: TableColumn[] = [
    { field: 'idcotizacion', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Teléfono' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'nombreUsuario', header: 'Vendedor' },
    {
      field: 'accionesCotizacion',
      header: 'Acciones',
      type: 'buttons',
      buttons: [
        {
          title: 'Ver detalle',
          icon: 'fa-solid fa-eye text-green-600',
          action: (row: Cotizacion) => this.verDetalle(row)
        },
        {
          title: 'Imprimir',
          icon: 'fa-solid fa-print text-purple-600',
          action: (row: Cotizacion) => this.previewPdf(row.idcotizacion)
        },
        {
          title: 'Enviar por correo',
          icon: 'fa-solid fa-envelope text-blue-600',
          action: (row: Cotizacion) => this.enviarCorreo(row)
        },
        {
          title: 'Eliminar',
          icon: 'fa-solid fa-trash text-red-600',
          action: (row: Cotizacion) => this.confirmarEliminar(row)
        }
      ]
    }
  ];

  columnsMobile: TableColumn[] = [
    { field: 'idcotizacion', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'nombreUsuario', header: 'Vendedor' },
    {
      field: 'accionesCotizacion',
      header: 'Acciones',
      type: 'buttons',
      buttons: [
        {
          title: 'Ver detalle',
          icon: 'fa-solid fa-eye text-green-600',
          action: (row: Cotizacion) => this.verDetalle(row)
        },
        {
          title: 'Ver cotizacion',
          icon: 'fa-solid fa-print text-purple-600',
          action: (row: Cotizacion) => this.previewPdf(row.idcotizacion)
        },
        {
          title: 'Enviar por correo',
          icon: 'fa-solid fa-envelope text-blue-600',
          action: (row: Cotizacion) => this.enviarCorreo(row)
        },
        {
          title: 'Eliminar',
          icon: 'fa-solid fa-trash text-red-600',
          action: (row: Cotizacion) => this.confirmarEliminar(row)
        }
      ]
    }
  ];

  private actualizarColumnas(): void {
    this.isMobile = window.innerWidth <= 480;
    if (this.isMobile) {
      this.columns = this.columnsMobile;
    } else {
      this.columns = this.columnsDesktop;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.actualizarColumnas();
  }

  constructor(
    private cotizacionService: CotizacionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.actualizarColumnas();
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

    this.cotizacionService
      .getCotizacionesByEmpresa(this.empresaId, page, this.pageSize, this.filtros)
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

  filtrar(filtros: FiltrosCotizacion): void {
    this.filtros = { ...filtros };
    if (this.filtros.fechaInicio) this.filtros.fechaInicio = this.formatDateToDDMMYYYY(this.filtros.fechaInicio);
    if (this.filtros.fechaFin) this.filtros.fechaFin = this.formatDateToDDMMYYYY(this.filtros.fechaFin);
    this.getCotizaciones(0);
  }

  limpiarFiltros(): void {
    this.filtros = {};
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

  async enviarCorreo(cotizacion: Cotizacion): Promise<void> {
    const { value: correo } = await Swal.fire({
      title: 'Enviar cotización por correo',
      input: 'email',
      inputLabel: 'Dirección de correo electrónico',
      inputPlaceholder: 'Ingrese el correo electrónico',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas escribir una dirección de correo!';
        }
        return null;
      }
    });

    if (correo) {
      this.loading = true;
      this.cotizacionService.enviarCorreo(cotizacion.idcotizacion, correo).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('¡Enviado!', 'La cotización ha sido enviada.', 'success');
        },
        error: (err) => {
          this.loading = false;
          console.error('Error enviando correo:', err);
          Swal.fire('Error', 'No se pudo enviar la cotización.', 'error');
        }
      });
    }
  }

  // ================================
  // PREVIEW PDF
  // ================================
  previewPdf(id: number): void {
    this.cotizacionActual =
      this.cotizaciones.find((cotizacion) => cotizacion.idcotizacion === id) ?? null;

    this.cotizacionService.obtenerCotizacionPosPdf(id).subscribe({
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
        Swal.fire('Error', 'No se pudo cargar el PDF POS de la cotizacion', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  async descargarPdfDesdePreview(): Promise<void> {

    if (!this.pdfBlob || !this.pdfIdActual) {
      return;
    }

    const nombreArchivo =
      `cotizacion-${this.pdfIdActual}.pdf`;

    try {

      // ==========================================
      // 🌐 NAVEGADOR
      // ==========================================
      if (!Capacitor.isNativePlatform()) {

        const url =
          window.URL.createObjectURL(this.pdfBlob);

        const a =
          document.createElement('a');

        a.href = url;
        a.download = nombreArchivo;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);

        return;
      }

      // ==========================================
      // 📱 ANDROID / CAPACITOR
      // ==========================================

      const base64 =
        await this.blobToBase64(this.pdfBlob);

      await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64,
        directory: Directory.Cache
      });

      const fileUri =
        await Filesystem.getUri({
          path: nombreArchivo,
          directory: Directory.Cache
        });

      await Share.share({
        title: `Cotización #${this.pdfIdActual}`,
        text: `Cotización POS #${this.pdfIdActual}`,
        url: fileUri.uri,
        dialogTitle: 'Compartir cotización'
      });

    } catch (error) {

      console.error(
        'Error descargando cotización:',
        error
      );

      Swal.fire(
        'Error',
        'No se pudo guardar o compartir la cotización.',
        'error'
      );
    }
  }

  async imprimirCotizacionPos(): Promise<void> {

    if (!this.pdfBlob || !this.pdfIdActual) {
      return;
    }

    try {

      // ==========================================
      // 🌐 NAVEGADOR
      // ==========================================
      if (!Capacitor.isNativePlatform()) {

        const url =
          window.URL.createObjectURL(this.pdfBlob);

        const printWindow =
          window.open(url, '_blank');

        if (!printWindow) {

          Swal.fire(
            'Bloqueado',
            'El navegador bloqueó la ventana de impresión.',
            'warning'
          );

          return;
        }

        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };

        window.setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 10000);

        return;
      }

      // ==========================================
      // 📱 ANDROID / CAPACITOR
      // ==========================================

      const nombreArchivo =
        `cotizacion-${this.pdfIdActual}.pdf`;

      const base64 =
        await this.blobToBase64(this.pdfBlob);

      await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64,
        directory: Directory.Cache
      });

      const fileUri =
        await Filesystem.getUri({
          path: nombreArchivo,
          directory: Directory.Cache
        });

      await Share.share({
        title: `Cotización #${this.pdfIdActual}`,
        text: 'Cotización POS',
        url: fileUri.uri,
        dialogTitle: 'Abrir cotización'
      });

    } catch (error) {

      console.error(
        'Error preparando cotización para impresión:',
        error
      );

      Swal.fire(
        'Error',
        'No se pudo abrir la cotización en Android.',
        'error'
      );
    }
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

  private blobToBase64(blob: Blob): Promise<string> {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onloadend = () => {

        try {

          const result =
            reader.result as string;

          const base64 =
            result.split(',')[1];

          if (!base64) {
            reject(
              new Error('No se pudo convertir el PDF a Base64')
            );
            return;
          }

          resolve(base64);

        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  }
}
