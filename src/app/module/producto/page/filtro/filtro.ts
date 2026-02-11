import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../categorias/service/categoria-service';
import { ProveedorService } from '../../../proveedor/service/proveedor-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-filtros-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro.html',
  styleUrls: ['./filtro.scss']
})
export class FiltrosProductoComponent implements OnInit {

  @Input() empresaId!: number;

  filtroNombre = '';
  filtroEstado = '';
  categoriaId: number | '' = '';
  proveedorId: number | '' = '';

  categorias: any[] = [];
  proveedores: any[] = [];

  @Output() filtrarNombre = new EventEmitter<string>();
  @Output() filtrarEstado = new EventEmitter<string>();
  @Output() filtrarCategoria = new EventEmitter<number | null>();
  @Output() filtrarProveedor = new EventEmitter<number | null>();

  constructor(
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit(): void {
    if (this.empresaId) {
      this.cargarCategorias();
      this.cargarProveedores();
    }
  }

  buscarPorNombre() {
    this.filtrarNombre.emit(this.filtroNombre);
  }

  filtrarPorEstado() {
    this.filtrarEstado.emit(this.filtroEstado);
  }

  filtrarPorCategoria() {
    this.filtrarCategoria.emit(
      this.categoriaId ? Number(this.categoriaId) : null
    );
  }

  filtrarPorProveedor() {
    this.filtrarProveedor.emit(
      this.proveedorId ? Number(this.proveedorId) : null
    );
  }

  cargarCategorias() {
    this.categoriaService.getCategoriasByEmpresaP(this.empresaId).subscribe({
      next: res => this.categorias = res || [],
      error: () => Swal.fire('Error', 'No se pudieron cargar categorías', 'error')
    });
  }

  cargarProveedores() {
    this.proveedorService.getProveedoresByEmpresaP(this.empresaId).subscribe({
      next: res => this.proveedores = res || [],
      error: () => Swal.fire('Error', 'No se pudieron cargar proveedores', 'error')
    });
  }
}
