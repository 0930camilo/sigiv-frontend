import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../auth/service/auth-service';
import { ProductoService } from '../../../producto/service/producto-service';
import { CategoriaService } from '../../../categorias/service/categoria-service';
import { CotizacionService } from '../../service/cotizacion-service';
import { Producto } from '../../../producto/model/productos.model';
import { Categoria } from '../../../categorias/model/categorias.model';
import { ItemCarritoCotizacion, CotizacionRequest } from '../../model/cotizacion.model';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-cotizacion.html',
  styleUrls: ['./registrar-cotizacion.scss']
})
export class RegistrarCotizacionComponent implements OnInit {

  // --- Datos del cliente ---
  nombreCliente = '';
  telefonoCliente = '';

  // --- Carrito ---
  carrito: ItemCarritoCotizacion[] = [];

  // --- Productos ---
  productos: Producto[] = [];
  loadingProductos = false;
  currentPage = 0;
  totalPages = 0;

  // --- Filtros ---
  filtroNombre = '';
  filtroCategoria = '';
  categorias: Categoria[] = [];

  // --- Cantidades por producto ---
  cantidades: { [productoId: number]: number } = {};

  empresaId!: number;
  usuarioId!: number;

  constructor(
    private authService: AuthService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private cotizacionService: CotizacionService,
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

  get totalCotizacion(): number {
    return this.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }

  // ================================
  // REGISTRAR COTIZACIÓN
  // ================================
  registrarCotizacion(): void {
    if (this.carrito.length === 0) {
      Swal.fire('Carrito vacío', 'Agrega productos al carrito', 'warning');
      return;
    }

    if (!this.nombreCliente.trim()) {
      Swal.fire('Error', 'Ingresa el nombre del cliente', 'warning');
      return;
    }

    const cotizacion: CotizacionRequest = {
      usuarioId: this.usuarioId,
      nombreCliente: this.nombreCliente.trim(),
      telefonoCliente: this.telefonoCliente.trim(),
      total: this.totalCotizacion,
      detalles: this.carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      }))
    };

    this.cotizacionService.crearCotizacion(cotizacion).subscribe({
      next: () => {
        Swal.fire('Cotización creada', 'La cotización se registró exitosamente', 'success');
        this.limpiarFormulario();
        this.cargarProductos(this.currentPage);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        const msg = err.error?.error || err.error?.message || 'Error al registrar la cotización';
        Swal.fire('Error', msg, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  limpiarFormulario(): void {
    this.carrito = [];
    this.nombreCliente = '';
    this.telefonoCliente = '';
    this.cantidades = {};
  }
}
