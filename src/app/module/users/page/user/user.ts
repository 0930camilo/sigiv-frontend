import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user-service';
import { AuthService } from '../../../auth/service/auth-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Register } from "../register/register";
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { FiltrosUsuarioComponent } from '../filtro/filtro';
import { EditarUsuarioComponent } from '../editar/editar';
import { EliminarUsuarioComponent } from '../eliminar/eliminar';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user',
  imports: [RouterModule, CommonModule, Register, ReusableTable, FiltrosUsuarioComponent, EditarUsuarioComponent, EliminarUsuarioComponent],
  templateUrl: './user.html',
  styleUrl: './user.scss'
})
export class User implements OnInit {
  usuarios: any[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;
  empresaId: number | null = null;
  pageSize = 10;

  filtroNombre: string = '';
  filtroEstado: string = '';

  mostrarEditar = false;
  mostrarEliminar = false;
  usuarioSeleccionado: any = null;

  columns: TableColumn[] = [
    { field: 'idUsuario', header: 'ID', type: 'text' },
    { field: 'nombres', header: 'Nombre', type: 'text' },
    { field: 'direccion', header: 'Dirección', type: 'text' },
    { field: 'telefono', header: 'Teléfono', type: 'text' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'acciones', header: 'Acciones', type: 'actions' },
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    if (this.empresaId) this.getUsuarios();
  }

  getUsuarios(page: number = 0): void {
    if (!this.empresaId) return;
    this.loading = true;

    this.userService.getUsersByEmpresa(
      this.empresaId, page, this.pageSize,
      this.filtroEstado || undefined,
      this.filtroNombre || undefined
    )
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (res: any) => {
          this.usuarios = res.data.usuarios || [];
          this.totalPages = res.data.totalPages || 1;
          this.currentPage = res.data.currentPage || 0;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
        }
      });
  }

  onFiltrarNombre(nombre: string): void {
    this.filtroNombre = nombre;
    this.getUsuarios(0);
  }

  onFiltrarEstado(estado: string): void {
    this.filtroEstado = estado;
    this.getUsuarios(0);
  }

  onAction(event: { action: string; row: any }) {
    this.usuarioSeleccionado = { ...event.row };
    if (event.action === 'edit') {
      this.mostrarEditar = true;
    } else if (event.action === 'delete') {
      this.mostrarEliminar = true;
    }
  }

  onUsuarioActualizado(): void {
    this.mostrarEditar = false;
    this.usuarioSeleccionado = null;
    this.getUsuarios(this.currentPage);
  }

  onUsuarioEliminado(): void {
    this.mostrarEliminar = false;
    this.usuarioSeleccionado = null;
    this.getUsuarios(this.currentPage);
  }

  onNextPage(): void {
    this.loading = true;
    this.getUsuarios(this.currentPage + 1);
  }

  onPreviousPage(): void {
    this.loading = true;
    this.getUsuarios(this.currentPage - 1);
  }
}
