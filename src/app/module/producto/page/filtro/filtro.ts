import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class FiltrosProductoComponent implements OnInit, OnChanges {

  @Input() empresaId!: number;

  filtroNombre = '';
  filtroCodigoBarra = '';
  filtroEstado = '';
  categoriaNombre = '';
  proveedorNombre = '';

  categorias: any[] = [];
  proveedores: any[] = [];

  @Output() filtrarNombre = new EventEmitter<string>();
  @Output() filtrarCodigoBarra = new EventEmitter<string>();
  @Output() filtrarEstado = new EventEmitter<string>();
  @Output() filtrarCategoria = new EventEmitter<string | null>();
  @Output() filtrarProveedor = new EventEmitter<string | null>();

  constructor(
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['empresaId'] && !changes['empresaId'].firstChange) {
      this.cargarDatos();
    }
  }

  private cargarDatos(): void {
    if (!this.empresaId) return;

    this.cargarCategorias();
    this.cargarProveedores();
  }

  buscarPorNombre(): void {
    this.filtrarNombre.emit(this.filtroNombre);
  }

  buscarPorCodigoBarra(): void {
    this.filtrarCodigoBarra.emit(this.filtroCodigoBarra);
  }

  public establecerCodigoBarra(codigo: string): void {
    this.filtroCodigoBarra = codigo;
    this.buscarPorCodigoBarra();
  }

  filtrarPorEstado(): void {
    this.filtrarEstado.emit(this.filtroEstado);
  }

  filtrarPorCategoria(): void {
    this.filtrarCategoria.emit(this.categoriaNombre || null);
  }

  filtrarPorProveedor(): void {
    this.filtrarProveedor.emit(this.proveedorNombre || null);
  }

  cargarCategorias(): void {
    if (!this.empresaId) return;

    this.categoriaService.getCategoriasByEmpresa(this.empresaId).subscribe({
      next: (res: any) => {
        this.categorias = res.data?.categorias || res.data || [];
        this.cdr.markForCheck();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar categorías', 'error')
    });
  }

  cargarProveedores(): void {
    if (!this.empresaId) return;

    this.proveedorService.getProveedoresByEmpresa(this.empresaId).subscribe({
      next: (res: any) => {
        this.proveedores = res.data?.proveedores || res.data || [];
        this.cdr.markForCheck();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar proveedores', 'error')
    });
  }
}
