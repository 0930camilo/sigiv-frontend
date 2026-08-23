import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { AuthService } from '../../../auth/service/auth-service';
import { CotizacionService } from '../../service/cotizacion-service';
import { Cotizacion } from '../../model/cotizacion.model';

import { FiltrosCotizacionesComponent, FiltrosCotizacion } from '../filtro/filtro';
import Swal from 'sweetalert2';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';


@Component({
  selector: 'app-cotizaciones-usuario',
  standalone: true,
  imports: [RouterModule, CommonModule, ReusableTable, FiltrosCotizacionesComponent],
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
  filtros: FiltrosCotizacion = {};

  cotizacionSeleccionada: Cotizacion | null = null;
  mostrarDetalle = false;

  mostrarPreviewPdf = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  pdfIdActual: number | null = null;
  cotizacionActual: Cotizacion | null = null;

  // Estado movil
  isMobile = false;

  columnsDesktop: TableColumn[] = [
    { field: 'idcotizacion', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Telefono' },
    { field: 'total', header: 'Total', type: 'number' },
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
        }
      ]
    }
  ];

  columnsMobile: TableColumn[] = [
    { field: 'idcotizacion', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'total', header: 'Total', type: 'number' },
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
        }

      ]
    }
  ];

  columns: TableColumn[] = [];

  constructor(
    private cotizacionService: CotizacionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
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
    this.actualizarColumnas();
    this.getCotizaciones(0);
  }

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

  getCotizaciones(page: number = 0): void {
    if (page < 0 || (this.totalPages && page >= this.totalPages)) return;

    this.loading = true;
    this.cotizacionService
      .getCotizacionesByUsuario(this.empresaId, this.usuarioId, page, this.pageSize, this.filtros)
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

  filtrar(filtros: FiltrosCotizacion) {
    this.filtros = filtros;
    this.getCotizaciones(0);
  }

  verDetalle(cotizacion: Cotizacion): void {
    this.cotizacionSeleccionada = cotizacion;
    this.mostrarDetalle = true;
    this.cdr.markForCheck();
  }

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
        this.cdr.markForCheck();
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
