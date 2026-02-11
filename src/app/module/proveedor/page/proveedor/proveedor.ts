import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { RegisterProveedor } from '../register/register';
import { ProveedorService } from '../../service/proveedor-service';
import { EditarProveedorComponent } from '../editar/editar';
import { EliminarProveedorComponent } from '../eliminar/eliminar';
import { FiltrosProveedorComponent } from '../filtro/filtro';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    RegisterProveedor,
    ReusableTable,
    EditarProveedorComponent,
    EliminarProveedorComponent,
    FiltrosProveedorComponent
  ],
  templateUrl: './proveedor.html',
  styleUrls: ['./proveedor.scss']
})
export class Proveedor implements OnInit {

  proveedores: any[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;
  empresaId: number | null = null;
  pageSize = 10;

  proveedorSeleccionado: any = null;
  proveedorAEliminar: any = null;

  filtroNombre: string = '';
  filtroEstado: string = '';

  columns: TableColumn[] = [
    { field: 'idProveedor', header: 'ID', type: 'text' },
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'telefono', header: 'Teléfono', type: 'text' },
    { field: 'direccion', header: 'Dirección', type: 'text' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  constructor(
    private proveedorService: ProveedorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    if (this.empresaId) this.getProveedores();
  }

  getProveedores(page: number = 0): void {
    if (!this.empresaId) return;

    this.loading = true;

    this.proveedorService.getProveedoresByEmpresa(this.empresaId, page, this.pageSize)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: any) => {
          this.proveedores = res.data.proveedores;
          this.totalPages = res.data.totalPages;
          this.currentPage = res.data.currentPage;
        },
        error: (err) => console.error('Error al cargar proveedores:', err)
      });
  }

  onProveedorCreado(nuevoProveedor: any): void {
    this.proveedores.unshift(nuevoProveedor);
  }

  onProveedorActualizado(proveedorEditado: any): void {
    const index = this.proveedores.findIndex(
      p => p.idProveedor === proveedorEditado.idProveedor
    );

    if (index !== -1) {
      this.proveedores[index] = proveedorEditado;
    }

    this.proveedorSeleccionado = null;
  }

  onProveedorEliminado(idProveedor: number): void {
    this.proveedores = this.proveedores.filter(
      p => p.idProveedor !== idProveedor
    );
    this.proveedorAEliminar = null;
  }

  onAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      this.proveedorSeleccionado = { ...event.row };
    } else if (event.action === 'delete') {
      this.proveedorAEliminar = { ...event.row };
    }
  }

  // ----------------------------
  //  FILTROS
  // ----------------------------

 // ----------------------------
//  FILTROS
// ----------------------------

filtrarPorNombre(nombre: string) {
  if (!nombre.trim()) {
    this.getProveedores();
    return;
  }

  this.proveedorService.buscarPorNombre(nombre)
    .subscribe({
      next: (res) => {
        // buscar devuelve un array directo
        this.proveedores = res;
      },
      error: (err) => console.error("Error en filtro por nombre:", err)
    });
}
filtrarPorEstado(estado: string) {
  if (!estado) {
    this.getProveedores();
    return;
  }

  this.proveedorService.listarPorEstado(estado)
    .subscribe({
      next: (res) => {
        this.proveedores = res.data ?? [];
      }
    });
}


}
