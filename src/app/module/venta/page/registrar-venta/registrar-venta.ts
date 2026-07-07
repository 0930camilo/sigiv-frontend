import { Component, OnDestroy, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../auth/service/auth-service';
import { ProductoService } from '../../../producto/service/producto-service';
import { CategoriaService } from '../../../categorias/service/categoria-service';
import { VentaService } from '../../service/venta-service';
import { Producto } from '../../../producto/model/productos.model';
import { Categoria } from '../../../categorias/model/categorias.model';
import { ItemCarrito, VentaRequest } from '../../model/venta.model';
import { VentaNotificacionService } from '../../../../shared/services/venta-notificacion.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-venta.html',
  styleUrls: ['./registrar-venta.scss']
})
export class RegistrarVentaComponent implements OnInit, OnDestroy {
  @ViewChild('scannerVideo') scannerVideo?: ElementRef<HTMLVideoElement>;

  // --- Datos del cliente ---
  nombreCliente = '';
  telefonoCliente = '';
  efectivo: number | null = null;

  // --- Carrito ---
  carrito: ItemCarrito[] = [];

  // --- Productos ---
  productos: Producto[] = [];
  loadingProductos = false;
  currentPage = 0;
  totalPages = 0;

  // --- Filtros ---
  filtroNombre = '';
  filtroCodigoBarra = '';
  filtroCategoria = '';
  categorias: Categoria[] = [];

  // --- Escaner de codigo de barras ---
  scannerActivo = false;
  scannerError = '';
  private scannerControls: { stop: () => void } | null = null;

  // --- Cantidades por producto (input temporal) ---
  cantidades: { [productoId: number]: number } = {};

  empresaId!: number;
  usuarioId!: number;

  constructor(
    private authService: AuthService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private ventaService: VentaService,
    private ventaNotificacion: VentaNotificacionService,
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

    this.cargarProductos(0);
    this.cargarCategorias();
  }

  // ================================
  // PRODUCTOS
  // ================================
  cargarProductos(page: number): void {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;

    this.loadingProductos = true;

    const filtros: any = {};
    if (this.filtroNombre.trim()) filtros.nombre = this.filtroNombre.trim();
    if (this.filtroCodigoBarra.trim()) filtros.codigoBarra = this.filtroCodigoBarra.trim();
    if (this.filtroCategoria) filtros.categoria = this.filtroCategoria;
    filtros.estado = 'Activo';

    this.productoService.getProductosByEmpresa(this.empresaId, page, 10, filtros)
      .subscribe({
        next: (data: any) => {
          this.productos = data?.productos ?? [];
          this.currentPage = data?.currentPage ?? 0;
          this.totalPages = data?.totalPages ?? 0;
          this.loadingProductos = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loadingProductos = false;
          this.cdr.markForCheck();
        }
      });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategoriasByEmpresa(this.empresaId, 0, 100, 'Activo')
      .subscribe({
        next: (res) => {
          this.categorias = res.data?.categorias ?? [];
          this.cdr.markForCheck();
        },
        error: () => {}
      });
  }

  buscar(): void {
    this.cargarProductos(0);
  }

  // ================================
  // ESCANER DE CODIGO DE BARRAS
  // ================================
  async iniciarEscaner(): Promise<void> {
    if (this.scannerActivo) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.scannerError = 'Este navegador no permite acceder a la camara para escanear.';
      this.cdr.markForCheck();
      return;
    }

    try {
      const zxing = await import('@zxing/browser');
      const reader = new zxing.BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 80
      });

      const videoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 60 }
      };

      this.scannerActivo = true;
      this.scannerError = '';
      this.cdr.markForCheck();

      setTimeout(() => {
        const video = this.scannerVideo?.nativeElement;
        if (!video) return;

        reader
          .decodeFromConstraints(
            { video: videoConstraints, audio: false },
            video,
            (result: { getText: () => string } | undefined) => {
              if (!result) return;

              const valor = result.getText()?.trim();
              if (!valor) return;

              this.filtroCodigoBarra = valor;
              this.buscar();
              this.detenerEscaner();
              Swal.fire('Codigo detectado', `Se busco: ${valor}`, 'success');
            }
          )
          .then((controls: { stop: () => void }) => {
            this.scannerControls = controls;
          })
          .catch(() => {
            this.scannerError = 'No se pudo iniciar el escaner. Revisa permisos de camara.';
            this.detenerEscaner();
          });
      }, 350);
    } catch {
      this.scannerError = 'No se pudo cargar el escaner en este navegador.';
      this.detenerEscaner();
      this.cdr.markForCheck();
    }
  }

  detenerEscaner(): void {
    if (this.scannerControls) {
      this.scannerControls.stop();
      this.scannerControls = null;
    }

    const video = this.scannerVideo?.nativeElement;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    this.scannerActivo = false;
    this.cdr.markForCheck();
  }

  // ================================
  // CARRITO
  // ================================
  agregarAlCarrito(producto: Producto): void {
    const cantidad = this.cantidades[producto.idProducto] || 1;

    if (cantidad <= 0) {
      Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'warning');
      return;
    }

    const existente = this.carrito.find(i => i.productoId === producto.idProducto);
    const cantidadTotal = (existente?.cantidad ?? 0) + cantidad;

    if (cantidadTotal > producto.cantidad) {
      Swal.fire('Error', `Solo hay ${producto.cantidad} unidades disponibles`, 'warning');
      return;
    }

    if (existente) {
      existente.cantidad = cantidadTotal;
    } else {
      this.carrito.push({
        productoId: producto.idProducto,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad,
        disponible: producto.cantidad
      });
    }

    this.cantidades[producto.idProducto] = 1;
    this.cdr.markForCheck();
  }

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    this.cdr.markForCheck();
  }

  get totalVenta(): number {
    return this.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }

  get cambio(): number {
    if (!this.efectivo || this.efectivo < this.totalVenta) return 0;
    return this.efectivo - this.totalVenta;
  }

  // ================================
  // REGISTRAR VENTA
  // ================================
  registrarVenta(): void {
    if (this.carrito.length === 0) {
      Swal.fire('Carrito vacío', 'Agrega productos al carrito', 'warning');
      return;
    }

    if (!this.nombreCliente.trim()) {
      Swal.fire('Error', 'Ingresa el nombre del cliente', 'warning');
      return;
    }

    if (!this.efectivo || this.efectivo < this.totalVenta) {
      Swal.fire('Error', 'El efectivo debe ser igual o mayor al total', 'warning');
      return;
    }

    const venta: VentaRequest = {
      usuarioId: this.usuarioId,
      nombreCliente: this.nombreCliente.trim(),
      telefonoCliente: this.telefonoCliente.trim(),
      efectivo: this.efectivo,
      detalles: this.carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      }))
    };

    this.ventaService.crearVenta(venta).subscribe({
      next: (res: any) => {
        Swal.fire('Venta registrada', res.message || 'Venta creada exitosamente', 'success');
        this.ventaNotificacion.notificarVentaRegistrada();
        this.limpiarFormulario();
        this.cargarProductos(this.currentPage);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Error al registrar la venta';
        Swal.fire('Error', msg, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  limpiarFormulario(): void {
    this.carrito = [];
    this.nombreCliente = '';
    this.telefonoCliente = '';
    this.efectivo = null;
    this.cantidades = {};
  }

  ngOnDestroy(): void {
    this.detenerEscaner();
  }
}
