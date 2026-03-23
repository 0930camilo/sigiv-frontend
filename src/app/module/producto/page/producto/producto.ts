import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { RegisterProducto } from '../register/register';
import { EmpresaService } from '../../../home/dashboard/empresa/service/empresa.service';
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

  getProductos(page: number = 0): void {
    if (!this.empresaId) return;

    this.loading = true;

    this.productoService
      .getProductosByEmpresa(
        this.empresaId,
        page,
        this.pageSize,
        this.filtros
      )
      .subscribe({
        next: (data) => {
          this.productos = data.productos ?? [];
          this.currentPage = data.currentPage ?? 0;
          this.totalPages = data.totalPages ?? 0;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }


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


filtrarPorNombre(nombre: string) {
  if (!nombre.trim()) {
    this.getProductos();
    return;
  }

  this.productoService.buscarPorNombre(nombre)
    .subscribe({
      next: (res) => {
        // buscar devuelve un array directo
        this.productos = res;
      },
      error: (err) => console.error("Error en filtro por nombre:", err)
    });
}
filtrarPorEstado(estado: string) {
  if (!estado) {
    this.getProductos();
    return;
  }

  this.productoService.listarPorEstado(estado)
    .subscribe({
      next: (res) => {
        this.productos = res.data ?? [];
      }
    });
}
filtrarPorCategoria(idCategoria: number | null) {
  if (!idCategoria || !this.empresaId) {
    this.getProductos();
    return;
  }

  this.empresaService
    .getProductosByCategoria(this.empresaId, idCategoria)
    .subscribe({
      next: res => {
        this.productos = res.data ?? res;
      },
      error: err => console.error('Error filtro categoría:', err)
    });
}

filtrarPorProveedor(idProveedor: number | null) {
  if (!idProveedor || !this.empresaId) {
    this.getProductos();
    return;
  }

  this.empresaService
    .getProductosByProveedor(this.empresaId, idProveedor)
    .subscribe({
      next: res => {
        this.productos = res.data ?? res;
      },
      error: err => console.error('Error filtro proveedor:', err)
    });
}


}
