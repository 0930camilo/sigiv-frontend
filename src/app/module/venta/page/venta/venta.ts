import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { VentaService } from '../../service/venta-service';
import { Abono, Venta } from '../../model/venta.model';
import { FiltrosVentasComponent } from '../filtro/filtro';
import Swal from 'sweetalert2';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
  filtroCliente: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // 🔥 detalle
  ventaSeleccionada: Venta | null = null;
  mostrarDetalle = false;

  // Estado movil
  isMobile = false;

  // 📄 preview factura
  mostrarPreviewFactura = false;
  facturaPreviewUrl: SafeResourceUrl | null = null;
  facturaBlob: Blob | null = null;
  facturaIdActual: number | null = null;
  facturaActual: Venta | null = null;
  abonosDetalle: Abono[] = [];
  cargandoAbonos = false;

// ===============================
// COLUMNAS ESCRITORIO
// ===============================
  columnsDesktop: TableColumn[] = [
    { field: 'idventa', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'tipoPago', header: 'Tipo pago' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'totalAbonado', header: 'Abonado', type: 'number' },
    { field: 'saldoPendiente', header: 'Saldo', type: 'number' },
    { field: 'estadoPago', header: 'Estado' },
    { field: 'nombreUsuario', header: 'Vendedor' },
    {
      field: 'accionesVenta',
      header: 'Acciones',
      type: 'buttons',
      buttons: [
        {
          title: 'Ver detalle',
          icon: 'fa-solid fa-eye text-green-600',
          action: (row: Venta) => this.verDetalle(row)
        },
        {
          title: 'Imprimir',
          icon: 'fa-solid fa-print text-purple-600',
          action: (row: Venta) => this.previewFactura(row.idventa)
        },
        {
          title: 'Enviar',
          icon: 'fa-solid fa-envelope text-amber-600',
          action: (row: Venta) => this.enviarFacturaPorCorreo(row)
        },
        {
          title: 'Registrar abono',
          icon: 'fa-solid fa-hand-holding-dollar text-blue-600',
          action: (row: Venta) => this.abrirRegistroAbono(row)
        }
      ]
    }
  ];

// ===============================
// COLUMNAS MÓVIL
// ===============================
  columnsMobile: TableColumn[] = [
    { field: 'idventa', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'tipoPago', header: 'Tipo pago' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'saldoPendiente', header: 'Saldo', type: 'number' },
    { field: 'estadoPago', header: 'Estado' },
    { field: 'nombreUsuario', header: 'Vendedor' },
    {
      field: 'accionesVenta',
      header: 'Acciones',
      type: 'buttons',
      buttons: [
        {
          title: 'Ver detalle',
          icon: 'fa-solid fa-eye text-green-600',
          action: (row: Venta) => this.verDetalle(row)
        },
        {
          title: 'Ver factura',
          icon: 'fa-solid fa-print text-purple-600',
          action: (row: Venta) => this.previewFactura(row.idventa)
        },
        {
          title: 'Enviar factura POS',
          icon: 'fa-solid fa-envelope text-amber-600',
          action: (row: Venta) => this.enviarFacturaPorCorreo(row)
        },
        {
          title: 'Registrar abono',
          icon: 'fa-solid fa-hand-holding-dollar text-blue-600',
          action: (row: Venta) => this.abrirRegistroAbono(row)
        }
      ]
    }
  ];

// Columnas que usa la tabla
  columns: TableColumn[] = [];

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

    this.actualizarColumnas();

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
        this.filtroId,
        this.fechaInicio,
        this.fechaFin,
        this.filtroCliente
      )
      .subscribe({
        next: (res) => {
          const ventas = res.data?.ventas ?? [];
          this.ventas = ventas.map((venta: Venta) => this.normalizarTotalesPago(venta));
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
  // FILTRO 🔥
  // ===============================
  filtrar(filtros: any): void {
    this.filtroId = filtros.idVenta;
    this.filtroCliente = filtros.cliente;
    this.fechaInicio = filtros.fechaInicio;
    this.fechaFin = filtros.fechaFin;
    this.getVentas(0); // 🔥 reinicia paginación
  }

  // ===============================
  // VER DETALLE
  // ===============================
  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
    this.cargarAbonos(venta.idventa);
    this.cdr.markForCheck();
  }

  private normalizarTotalesPago(venta: Venta): Venta {
    const tipoPago = venta.tipoPago || 'CONTADO';
    const totalAbonado = Number(venta.totalAbonado ?? (tipoPago === 'CREDITO' ? 0 : venta.total ?? 0));
    const saldoPendiente = Number(venta.saldoPendiente ?? Math.max((venta.total ?? 0) - totalAbonado, 0));
    return {
      ...venta,
      tipoPago,
      totalAbonado,
      saldoPendiente,
      estadoPago: venta.estadoPago || (saldoPendiente > 0 ? 'PENDIENTE' : 'PAGADA')
    };
  }

  private cargarAbonos(ventaId: number): void {
    this.cargandoAbonos = true;
    this.ventaService.getAbonosByVentaId(ventaId).subscribe({
      next: (res) => {
        this.abonosDetalle = res.data ?? [];
        this.cargandoAbonos = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.abonosDetalle = [];
        this.cargandoAbonos = false;
        this.cdr.markForCheck();
      }
    });
  }

  puedeRegistrarAbono(venta: Venta): boolean {
    const saldo = Number(venta.saldoPendiente ?? 0);
    return venta.tipoPago === 'CREDITO' && saldo > 0;
  }

  async abrirRegistroAbono(venta: Venta): Promise<void> {
    if (!this.puedeRegistrarAbono(venta)) {
      Swal.fire('Sin saldo pendiente', 'Solo se pueden registrar abonos en ventas a credito pendientes.', 'info');
      return;
    }

    const saldoPendiente = Number(venta.saldoPendiente ?? 0);
    const result = await Swal.fire({
      title: `Registrar abono #${venta.idventa}`,
      html:
        `<div style="text-align:left;display:grid;gap:8px">` +
        `<p><strong>Saldo pendiente:</strong> ${saldoPendiente.toLocaleString('es-CO')}</p>` +
        `<input id="abono-valor" class="swal2-input" placeholder="Valor del abono" inputmode="numeric">` +
        `<select id="abono-metodo" class="swal2-input">` +
        `<option value="EFECTIVO">Efectivo</option>` +
        `<option value="TRANSFERENCIA">Transferencia</option>` +
        `<option value="TARJETA_DEBITO">Tarjeta debito</option>` +
        `<option value="TARJETA_CREDITO">Tarjeta credito</option>` +
        `<option value="OTRO">Otro</option>` +
        `</select>` +
        `<input id="abono-observacion" class="swal2-input" placeholder="Observacion (opcional)">` +
        `</div>`,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const valorInput = document.getElementById('abono-valor') as HTMLInputElement | null;
        const metodoInput = document.getElementById('abono-metodo') as HTMLSelectElement | null;
        const observacionInput = document.getElementById('abono-observacion') as HTMLInputElement | null;
        const valor = Number((valorInput?.value || '').replace(/\./g, '').replace(/,/g, ''));
        if (!valor || valor <= 0) {
          Swal.showValidationMessage('Ingresa un valor de abono valido');
          return;
        }
        if (valor > saldoPendiente) {
          Swal.showValidationMessage('El abono no puede superar el saldo pendiente');
          return;
        }
        return {
          valor,
          metodoPago: metodoInput?.value || 'EFECTIVO',
          observacion: observacionInput?.value || ''
        };
      }
    });

    if (!result.isConfirmed || !result.value) return;

    const usuarioId = Number(this.authService.getUserId());
    if (!usuarioId) {
      Swal.fire('Error', 'No se encontro el usuario autenticado para registrar el abono.', 'error');
      return;
    }

    this.ventaService.registrarAbono(venta.idventa, { usuarioId, ...result.value }).subscribe({
      next: () => {
        const nuevoTotalAbonado = Number(venta.totalAbonado ?? 0) + Number(result.value.valor);
        const nuevoSaldo = Math.max((venta.total ?? 0) - nuevoTotalAbonado, 0);
        venta.totalAbonado = nuevoTotalAbonado;
        venta.saldoPendiente = nuevoSaldo;
        venta.estadoPago = nuevoSaldo === 0 ? 'PAGADA' : 'PENDIENTE';
        if (this.ventaSeleccionada?.idventa === venta.idventa) {
          this.ventaSeleccionada = { ...venta };
          this.cargarAbonos(venta.idventa);
        }
        this.cdr.markForCheck();
        Swal.fire('Abono registrado', 'El abono se registro correctamente.', 'success');
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo registrar el abono.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  // ===============================
  // PREVIEW FACTURA PDF
  // ===============================
  previewFactura(id: number): void {
    this.facturaActual = this.ventas.find((venta) => venta.idventa === id) ?? null;

    this.ventaService.descargarFacturaPos(id).subscribe({
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
  async descargarFacturaDesdePreview(): Promise<void> {
    if (!this.facturaBlob || !this.facturaIdActual) {
      return;
    }

    const nombreArchivo = `factura-${this.facturaIdActual}.pdf`;

    try {

      // ==========================================
      // NAVEGADOR WEB
      // ==========================================
      if (!Capacitor.isNativePlatform()) {

        const url = window.URL.createObjectURL(this.facturaBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);

        return;
      }

      // ==========================================
      // ANDROID / CAPACITOR
      // ==========================================

      const base64 = await this.blobToBase64(this.facturaBlob);

      await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64,
        directory: Directory.Cache
      });

      const fileUri = await Filesystem.getUri({
        path: nombreArchivo,
        directory: Directory.Cache
      });

      await Share.share({
        title: `Factura #${this.facturaIdActual}`,
        text: `Factura #${this.facturaIdActual}`,
        url: fileUri.uri,
        dialogTitle: 'Compartir factura'
      });

    } catch (error) {

      console.error('Error descargando factura:', error);

      Swal.fire(
        'Error',
        'No se pudo guardar o compartir la factura.',
        'error'
      );
    }
  }
  async imprimirFacturaPos(): Promise<void> {

    if (!this.facturaBlob || !this.facturaIdActual) {
      return;
    }

    try {

      // ==========================================
      // NAVEGADOR WEB
      // ==========================================
      if (!Capacitor.isNativePlatform()) {

        const url = window.URL.createObjectURL(this.facturaBlob);

        const printWindow = window.open(url, '_blank');

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
      // ANDROID / CAPACITOR
      // ==========================================

      const nombreArchivo =
        `factura-${this.facturaIdActual}.pdf`;

      const base64 =
        await this.blobToBase64(this.facturaBlob);

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
        title: `Factura #${this.facturaIdActual}`,
        text: 'Factura POS',
        url: fileUri.uri,
        dialogTitle: 'Abrir factura'
      });

    } catch (error) {

      console.error(
        'Error preparando factura para impresión:',
        error
      );

      Swal.fire(
        'Error',
        'No se pudo abrir la factura en Android.',
        'error'
      );
    }
  }

  // ===============================
  // CERRAR PREVIEW FACTURA
  // ===============================
  cerrarPreviewFactura(): void {
    this.mostrarPreviewFactura = false;
    this.facturaPreviewUrl = null;
    this.facturaBlob = null;
    this.facturaIdActual = null;
    this.facturaActual = null;
    this.cdr.markForCheck();
  }

  async enviarFacturaPorCorreo(venta: Venta): Promise<void> {
    const resultado = await Swal.fire({
      title: `Enviar factura POS #${venta.idventa}`,
      input: 'email',
      inputLabel: 'Correo del cliente',
      inputValue: venta.correoCliente || '',
      inputPlaceholder: 'cliente@correo.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) return 'Ingresa el correo del cliente';
        return null;
      }
    });

    if (!resultado.value) return;

    Swal.fire({
      title: 'Enviando factura POS',
      text: 'Estamos enviando la factura POS por correo.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.ventaService.enviarFacturaPorCorreo(venta.idventa, resultado.value).subscribe({
      next: () => {
        Swal.fire('Factura enviada', 'La factura POS fue enviada correctamente por correo.', 'success');
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo enviar la factura POS por correo.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onloadend = () => {

        const result = reader.result as string;

        const base64 = result.split(',')[1];

        resolve(base64);
      };

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
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
}
