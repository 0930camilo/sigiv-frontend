import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { ProductoService } from '../../service/producto-service';
import { CategoriaService } from '../../../categorias/service/categoria-service';
import { ProveedorService } from '../../../proveedor/service/proveedor-service';
import { AuthService } from '../../../auth/service/auth-service';

import { Producto } from '../../model/productos.model';

@Component({
  selector: 'app-edit-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class EditarProductoComponent implements OnInit, OnChanges {

  @Input() producto!: Producto;
  @Output() productoActualizado = new EventEmitter<Producto>();
  @Output() cerrar = new EventEmitter<void>();

  formEdit!: FormGroup;
  loading = false;

  categorias: any[] = [];
  proveedores: any[] = [];
  empresaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    private authService: AuthService
  ) {
    this.initForm();
  }

  // ===============================
  // INIT
  // ===============================
  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();

    if (!this.empresaId) {
      Swal.fire('Error', 'Empresa no identificada', 'error');
      return;
    }

    this.cargarCategorias();
    this.cargarProveedores();
  }

  // ===============================
  // CUANDO CAMBIA EL PRODUCTO
  // ===============================
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] && this.producto) {
      this.formEdit.patchValue({
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion,
        cantidad: this.producto.cantidad,
        precioCompra: this.producto.precioCompra,
        precio: this.producto.precio,
        estado: this.producto.estado,
        categoriaId: this.producto.categoriaId,
        proveedorId: this.producto.proveedorId
      });
    }
  }

  // ===============================
  // FORM
  // ===============================
  private initForm(): void {
    this.formEdit = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      precioCompra: [0, Validators.required],
      precio: [0, Validators.required],
      estado: ['Activo', Validators.required],
      categoriaId: [null, Validators.required],
      proveedorId: [null] // puede ser null según tu backend
    });
  }

  // ===============================
  // CARGAR LISTAS
  // ===============================
  cargarCategorias(): void {
    this.categoriaService.getCategoriasByEmpresa(this.empresaId!).subscribe({
      next: res => this.categorias = res.data.categorias || [],
      error: () => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    });
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedoresByEmpresa(this.empresaId!).subscribe({
      next: res => this.proveedores = res.data.proveedores || [],
      error: () => Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error')
    });
  }

  // ===============================
  // GUARDAR CAMBIOS
  // ===============================
  guardarCambios(): void {

    if (this.formEdit.invalid) {
      Swal.fire('Formulario incompleto', 'Completa todos los campos', 'warning');
      return;
    }

    this.loading = true;

    const payload = this.formEdit.value;

    this.productoService.updateProducto(this.producto.idProducto, payload)
      .subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Producto actualizado',
            timer: 1500,
            showConfirmButton: false
          });

          this.productoActualizado.emit(res.data);
          this.cerrar.emit();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        },
        complete: () => this.loading = false
      });
  }
}
