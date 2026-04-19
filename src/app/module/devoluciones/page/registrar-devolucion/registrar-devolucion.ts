import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../../auth/service/auth-service';
import { VentaService } from '../../../venta/service/venta-service';
import { DevolucionService } from '../../service/devolucion-service';
import { ProductoService } from '../../../producto/service/producto-service';
import { Venta } from '../../../venta/model/venta.model';
import { Producto } from '../../../producto/model/productos.model';
import { DevolucionRequest } from '../../model/devolucion.model';

@Component({
  selector: 'app-registrar-devolucion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registrar-devolucion.html',
  styleUrls: ['./registrar-devolucion.scss']
})
export class RegistrarDevolucionComponent implements OnInit {

  empresaId!: number;

  // Buscar venta
  ventaIdBuscar: number | null = null;
  ventaEncontrada: Venta | null = null;
  buscandoVenta = false;

  // Producto seleccionado
  productoSeleccionado: Producto | null = null;

  // Formulario
  cantidad: number | null = null;
  motivo = '';

  // Catálogo productos
  productos: Producto[] = [];
  busquedaProducto = '';
  loadingProductos = false;
  currentPageProductos = 0;
  totalPagesProductos = 0;

  constructor(
    private authService: AuthService,
    private ventaService: VentaService,
    private devolucionService: DevolucionService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const empresa = this.authService.getEmpresaId();
    if (empresa) {
      this.empresaId = Number(empresa);
      this.cargarProductos();
    }
  }

  // ===============================
  // BUSCAR VENTA
  // ===============================
  buscarVenta(): void {
    if (!this.ventaIdBuscar) return;

    this.buscandoVenta = true;
    this.ventaEncontrada = null;

    this.ventaService.getVentasByEmpresa(this.empresaId, 0, 10, this.ventaIdBuscar).subscribe({
      next: (res) => {
        const ventas = res.data?.ventas ?? [];
        if (ventas.length > 0) {
          this.ventaEncontrada = ventas[0];
        } else {
          Swal.fire('No encontrada', 'No se encontró la venta con ese ID', 'warning');
        }
        this.buscandoVenta = false;
        this.cdr.markForCheck();
      },
      error: () => {
        Swal.fire('Error', 'Error al buscar la venta', 'error');
        this.buscandoVenta = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ===============================
  // CARGAR PRODUCTOS
  // ===============================
  cargarProductos(page = 0): void {
    this.loadingProductos = true;

    const filtros: any = {};
    if (this.busquedaProducto.trim()) {
      filtros.nombre = this.busquedaProducto.trim();
    }

    this.productoService.getProductosByEmpresa(this.empresaId, page, 10, filtros).subscribe({
      next: (data: any) => {
        this.productos = data?.productos ?? [];
        this.currentPageProductos = data?.currentPage ?? 0;
        this.totalPagesProductos = data?.totalPages ?? 0;
        this.loadingProductos = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingProductos = false;
        this.cdr.markForCheck();
      }
    });
  }

  buscarProductos(): void {
    this.cargarProductos(0);
  }

  // ===============================
  // SELECCIONAR PRODUCTO
  // ===============================
  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado = producto;
  }

  // ===============================
  // REGISTRAR DEVOLUCIÓN
  // ===============================
  registrarDevolucion(): void {
    if (!this.ventaEncontrada) {
      Swal.fire('Error', 'Primero busca una venta', 'warning');
      return;
    }
    if (!this.productoSeleccionado) {
      Swal.fire('Error', 'Selecciona un producto del catálogo', 'warning');
      return;
    }
    if (!this.cantidad || this.cantidad <= 0) {
      Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'warning');
      return;
    }
    if (!this.motivo.trim()) {
      Swal.fire('Error', 'Ingresa el motivo de la devolución', 'warning');
      return;
    }

    const request: DevolucionRequest = {
      ventaId: this.ventaEncontrada.idventa,
      productoId: this.productoSeleccionado.idProducto,
      cantidad: this.cantidad,
      motivo: this.motivo.trim()
    };

    this.devolucionService.registrarDevolucion(request).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Devolución registrada correctamente', 'success');
        this.limpiarFormulario();
      },
      error: (err) => {
        const msg = err.error?.message || err.error || 'Error al registrar la devolución';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  // ===============================
  // LIMPIAR FORMULARIO
  // ===============================
  limpiarFormulario(): void {
    this.productoSeleccionado = null;
    this.cantidad = null;
    this.motivo = '';
  }
}
