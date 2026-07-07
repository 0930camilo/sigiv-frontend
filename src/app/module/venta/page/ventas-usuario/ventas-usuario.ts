import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { AuthService } from '../../../auth/service/auth-service';
import { VentaService } from '../../service/venta-service';
import { Venta } from '../../model/venta.model';
import { PosPrintService } from '../../../../shared/services/pos-print.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ventas-usuario',
  standalone: true,
  imports: [RouterModule, CommonModule, ReusableTable],
  templateUrl: './ventas-usuario.html',
  styleUrls: ['./ventas-usuario.scss']
})
export class VentasUsuarioComponent implements OnInit {
  ventas: Venta[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;
  usuarioId!: number;
  pageSize = 10;

  ventaSeleccionada: Venta | null = null;
  mostrarDetalle = false;

  mostrarPreviewFactura = false;
  facturaPreviewUrl: SafeResourceUrl | null = null;
  facturaBlob: Blob | null = null;
  facturaIdActual: number | null = null;
  facturaActual: Venta | null = null;

  columns: TableColumn[] = [
    { field: 'idventa', header: 'ID' },
    { field: 'fecha', header: 'Fecha', type: 'date' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Teléfono' },
    { field: 'total', header: 'Total', type: 'number' },
    { field: 'efectivo', header: 'Efectivo', type: 'number' },
    { field: 'cambio', header: 'Cambio', type: 'number' },
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
          title: 'Enviar factura',
          icon: 'fa-solid fa-envelope text-amber-600',
          action: (row: Venta) => this.enviarFacturaPorCorreo(row)
        },
        {
          title: 'Ver factura PDF',
          icon: 'fa-solid fa-file-invoice text-blue-600',
          action: (row: Venta) => this.previewFactura(row.idventa)
        },
        {
          title: 'Imprimir POS',
          icon: 'fa-solid fa-print text-purple-600',
          action: (row: Venta) => this.imprimirFacturaPos(row)
        }
      ]
    }
  ];

  constructor(
    private ventaService: VentaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private posPrintService: PosPrintService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUserId();
    if (!usuario) {
      console.error('Usuario no encontrado');
      return;
    }
    this.usuarioId = Number(usuario);
    this.getVentas(0);
  }

  getVentas(page: number = 0): void {
    if (page < 0 || (this.totalPages && page >= this.totalPages)) {
      return;
    }
    this.loading = true;
    this.ventaService
      .getVentasByUsuario(this.usuarioId, page, this.pageSize)
      .subscribe({
        next: (res: any) => {
          this.ventas = res.data?.ventas ?? [];
          this.currentPage = res.data?.currentPage ?? 0;
          this.totalPages = res.data?.totalPages ?? 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error cargando ventas:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
    this.cdr.markForCheck();
  }

  previewFactura(id: number): void {
    this.facturaActual = this.ventas.find((venta) => venta.idventa === id) ?? null;

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

  descargarFacturaDesdePreview(): void {
    if (!this.facturaBlob || !this.facturaIdActual) return;

    const url = window.URL.createObjectURL(this.facturaBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${this.facturaIdActual}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  imprimirFacturaPos(venta: Venta | null = this.facturaActual): void {
    if (!venta) return;

    this.posPrintService.imprimir({
      tipo: 'FACTURA',
      numero: venta.idventa,
      fecha: venta.fecha,
      empresaNombre: venta.empresaNombre,
      nombreCliente: venta.nombreCliente,
      telefonoCliente: venta.telefonoCliente,
      documentoCliente: venta.documentoCliente,
      nombreUsuario: venta.nombreUsuario,
      total: venta.total,
      efectivo: venta.efectivo,
      cambio: venta.cambio,
      detalles: venta.detalles ?? []
    });
  }

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
      title: `Enviar factura #${venta.idventa}`,
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
      title: 'Enviando factura',
      text: 'Estamos enviando la factura por correo.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.ventaService.enviarFacturaPorCorreo(venta.idventa, resultado.value).subscribe({
      next: () => {
        Swal.fire('Factura enviada', 'La factura fue enviada correctamente por correo.', 'success');
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo enviar la factura por correo.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }
}
