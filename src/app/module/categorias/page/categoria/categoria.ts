import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../auth/service/auth-service';
import { CategoriaService } from '../../service/categoria-service';
import { Categoria, CategoriasResponse } from '../../model/categorias.model';

import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { RegisterCategoria } from '../register/register';
import { EditarCategoriaComponent } from '../editar/editar';
import { EliminarCategoriaComponent } from '../eliminar/eliminar';
import { FiltrosCategoriaComponent } from '../filtro/filtro';
import { TableColumn } from '../../../../shared/interface/TableColumn';

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
export class CategoriaComponent implements OnInit {

  categorias: Categoria[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;
  empresaId: number | null = null;
  pageSize = 10;

  filtroNombre = '';
  filtroEstado = '';

  categoriaSeleccionada: Categoria | null = null;
  categoriaAEliminar: Categoria | null = null;

  columns: TableColumn[] = [
    { field: 'idCategoria', header: 'ID', type: 'text' },
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  constructor(
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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

    this.categoriaService
      .getCategoriasByEmpresa(
        this.empresaId,
        page,
        this.pageSize,
        this.filtroEstado,
        this.filtroNombre
      )
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res: CategoriasResponse) => {
          this.categorias = res.data.categorias;
          this.totalPages = res.data.totalPages;
          this.currentPage = res.data.currentPage;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error al cargar categorías:', err)
      });
  }

  filtrarPorNombre(nombre: string) {
    this.filtroNombre = nombre;
    this.getCategorias(0);
  }

  filtrarPorEstado(estado: string) {
    this.filtroEstado = estado;
    this.getCategorias(0);
  }

  onCategoriaCreada(nuevaCategoria: Categoria): void {
    this.getCategorias(0);
  }

  onCategoriaActualizada(categoriaEditada: Categoria): void {
    this.getCategorias(this.currentPage);
    this.categoriaSeleccionada = null;
  }

  onCategoriaEliminada(idCategoria: number): void {
    this.getCategorias(this.currentPage);
    this.categoriaAEliminar = null;
  }

  onAction(event: { action: string; row: Categoria }) {
    if (event.action === 'edit') {
      this.categoriaSeleccionada = { ...event.row };
    } else if (event.action === 'delete') {
      this.categoriaAEliminar = { ...event.row };
    }
  }
}
