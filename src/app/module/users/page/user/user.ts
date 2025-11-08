import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user-service';
import { AuthService } from '../../../auth/service/auth-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Register } from "../register/register";
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user',
  imports: [RouterModule, CommonModule, Register, ReusableTable],
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    if (this.empresaId) this.getUsuarios();
  }

 getUsuarios(page: number = 0): void {
  if (!this.empresaId) return;
  this.loading = true;

  this.userService.getUsersByEmpresa(this.empresaId, page, this.pageSize)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (res: any) => {
        this.usuarios = res.data.usuarios || [];
        this.totalPages = res.data.totalPages || 1;
        this.currentPage = res.data.currentPage || 0;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
}

  onAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      console.log('Editar:', event.row);
    } else if (event.action === 'delete') {
      console.log('Eliminar:', event.row);
    }
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
