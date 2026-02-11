import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { RegisterCategoria } from '../register/register';
import { CategoriaService } from '../../service/categoria-service';
import { EditarCategoriaComponent } from '../editar/editar';
import { EliminarCategoriaComponent } from '../eliminar/eliminar';
import { FiltrosCategoriaComponent } from '../filtro/filtro';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    RegisterCategoria,
    ReusableTable,
    EditarCategoriaComponent,
    EliminarCategoriaComponent,
    FiltrosCategoriaComponent
  ],
  templateUrl: './categoria.html',
  styleUrls: ['./categoria.scss']
})
export class Categoria implements OnInit {

  categorias: any[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;
  empresaId: number | null = null;
  pageSize = 10;

  categoriaSeleccionada: any = null;
  categoriaAEliminar: any = null;

  columns: TableColumn[] = [
    { field: 'idCategoria', header: 'ID', type: 'text' },
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  constructor(
    private categoriaService: CategoriaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    if (this.empresaId) {
      this.getCategorias();
    }
  }

  getCategorias(page: number = 0): void {
    if (!this.empresaId) return;

    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;

    this.loading = true;

    this.categoriaService.getCategoriasByEmpresa(this.empresaId, page, this.pageSize)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: any) => {
          this.categorias = res.data.categorias;
          this.totalPages = res.data.totalPages;
          this.currentPage = res.data.currentPage;
        },
        error: (err) => console.error('Error al cargar categorías:', err)
      });
  }

  onCategoriaCreada(nuevaCategoria: any): void {
    this.categorias.unshift(nuevaCategoria);
  }

  onCategoriaActualizada(categoriaEditada: any): void {
    const index = this.categorias.findIndex(
      c => c.idCategoria === categoriaEditada.idCategoria
    );

    if (index !== -1) {
      this.categorias[index] = categoriaEditada;
    }

    this.categoriaSeleccionada = null;
  }


 onCategoriaEliminada(idCategoria: number): void {
    this.categorias = this.categorias.filter(
      c => c.idCategoria !== idCategoria
    );
    this.categoriaAEliminar = null;
  }

  onAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      this.categoriaSeleccionada = { ...event.row };
    } else if (event.action === 'delete') {
      this.categoriaAEliminar = { ...event.row };
    }
  }



filtrarPorNombre(nombre: string) {
  if (!nombre.trim()) {
    this.getCategorias();
    return;
  }

  this.categoriaService.buscarPorNombre(nombre)
    .subscribe({
      next: (res) => {
        // buscar devuelve un array directo
        this.categorias = res;
      },
      error: (err) => console.error("Error en filtro por nombre:", err)
    });
}
filtrarPorEstado(estado: string) {
  if (!estado) {
    this.getCategorias();
    return;
  }

  this.categoriaService.listarPorEstado(estado)
    .subscribe({
      next: (res) => {
        this.categorias = res.data ?? [];
      }
    });
}

}
