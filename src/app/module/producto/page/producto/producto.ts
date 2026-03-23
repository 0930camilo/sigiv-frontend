import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { RegisterProducto } from '../register/register';
import { ProductoService } from '../../service/producto-service';
import { EditarProductoComponent } from '../editar/editar';
import { EliminarProductoComponent } from '../eliminar/eliminar';
import { FiltrosProductoComponent } from '../filtro/filtro';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    RegisterProducto,
    ReusableTable,
    EditarProductoComponent,
    EliminarProductoComponent,
    FiltrosProductoComponent
  ],
  templateUrl: './producto.html',
  styleUrls: ['./producto.scss']
})
export class Producto implements OnInit {

  productos: any[] = [];
  loading = false;

  empresaId: number | null = null;
  productoSeleccionado: any = null;
  productoAEliminar: any = null;

  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  filtros: any = {
    nombre: '',
    estado: '',
    categoria: null,
    proveedor: null
  };

  columns: TableColumn[] = [
    { field: 'idProducto', header: 'ID', type: 'text' },
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'descripcion', header: 'Descripción', type: 'text' },
    { field: 'cantidad', header: 'Cantidad', type: 'number' },
    { field: 'precioCompra', header: 'Precio Compra', type: 'currency' },
    { field: 'precio', header: 'Precio Venta', type: 'currency' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'categoriaNombre', header: 'Categoría', type: 'text' },
    { field: 'proveedorNombre', header: 'Proveedor', type: 'text' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  constructor(
    private productoService: ProductoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();

    if (this.empresaId) {
      this.getProductos();
    }
  }

  // ===============================
  // LISTAR PRODUCTOS
  // ===============================
  getProductos(page: number = 0): void {
    if (!this.empresaId) return;

    this.loading = true;

    console.log("FILTROS ENVIADOS:", this.filtros);

    this.productoService
      .getProductosByEmpresa(
        this.empresaId,
        page,
        this.pageSize,
        this.filtros
      )
      .subscribe({
        next: (data) => {
          this.productos = data.productos;
          this.currentPage = data.currentPage;
          this.totalPages = data.totalPages;
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando productos:", err);
          this.loading = false;
        }
      });
  }

  // ===============================
  // PAGINACIÓN
  // ===============================
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.getProductos(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.getProductos(this.currentPage - 1);
    }
  }

  // ===============================
  // CRUD UI
  // ===============================
  onProductoCreado(nuevoProducto: any): void {
    this.productos.unshift(nuevoProducto);
  }

  onProductoActualizado(productoEditado: any): void {
    const index = this.productos.findIndex(
      p => p.idProducto === productoEditado.idProducto
    );

    if (index !== -1) {
      this.productos[index] = productoEditado;
    }

    this.productoSeleccionado = null;
  }

  onProductoEliminado(idProducto: number): void {
    this.productos = this.productos.filter(
      p => p.idProducto !== idProducto
    );

    this.productoAEliminar = null;
  }

  onAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      this.productoSeleccionado = { ...event.row };
    } else if (event.action === 'delete') {
      this.productoAEliminar = { ...event.row };
    }
  }

  // ===============================
  // FILTROS 🔥
  // ===============================
  filtrarPorNombre(nombre: string) {
    this.filtros.nombre = nombre;
    this.getProductos(0);
  }

  filtrarPorEstado(estado: string) {
    this.filtros.estado = estado;
    this.getProductos(0);
  }

  filtrarPorCategoria(nombre: string | null) {
    this.filtros.categoria = nombre || '';
    this.getProductos(0);
  }

  filtrarPorProveedor(nombre: string | null) {
    this.filtros.proveedor = nombre || '';
    this.getProductos(0);
  }
}
