import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProductoService } from '../../service/producto-service';
import { ProductoCreateRequest } from '../../model/productos.model';
import { CategoriaService } from '../../../categorias/service/categoria-service';
import { ProveedorService } from '../../../proveedor/service/proveedor-service';
import { AuthService } from '../../../auth/service/auth-service';
import { UserService } from '../../../users/service/user-service';



@Component({
  selector: 'app-register-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterProducto implements OnInit {

  @Output() productoCreado = new EventEmitter<any>();

  mostrarModal = false;
  creandoProducto = false;
  formProducto!: FormGroup;

  categorias: any[] = [];
  proveedores: any[] = [];

  //empresaId: number = Number(localStorage.getItem("empresaId"));}
  empresaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    private authService: AuthService,

  ) {
    this.initForm();
  }

  ngOnInit(): void {
   this.empresaId = this.authService.getEmpresaId();
  }

  private initForm(): void {
    this.formProducto = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      cantidad: [0, Validators.required],
      precioCompra: [0, Validators.required],
      precio: [0, Validators.required],
      estado: ['Activo', Validators.required],
      categoriaId: [null, Validators.required],
      proveedorId: [null, Validators.required]
    });
  }

  abrirModal(): void {
  this.mostrarModal = true;
  this.cargarCategorias();
  this.cargarProveedores();
}

  cerrarModal(): void {
    this.mostrarModal = false;

    this.formProducto.reset({
      estado: 'Activo',
      cantidad: 0,
      precio: 0,
      precioCompra: 0,
      categoriaId: null,
      proveedorId: null
    });
  }

  // ===============================
cargarCategorias() {
  console.log("Empresa enviada >>> ", this.empresaId); // 👈 IMPORTANTÍSIMO

  this.categoriaService.getCategoriasByEmpresa(this.empresaId!).subscribe({
    next: (res) => {
      console.log("Respuesta categorías:", res);
      this.categorias = res.data.categorias || [];
    },
    error: (err) => {
      console.error("Error cargando categorías:", err);
      Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
    }
  });
}

cargarProveedores() {
  if (!this.empresaId) return;

  this.proveedorService
    .getProveedoresByEmpresa(this.empresaId, 0, 1000)
    .subscribe({
      next: (res) => {
        console.log("Respuesta proveedores:", res);
        this.proveedores = res.data?.proveedores || [];
      },
      error: (err) => {
        console.error("Error cargando proveedores:", err);
        Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
      }
    });
}


  // ===============================
  //  Crear Producto
  // ===============================
  crearProducto(): void {

    if (this.formProducto.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios.'
      });
      return;
    }

    const payload: ProductoCreateRequest = this.formProducto.value;
    this.creandoProducto = true;

    this.productoService.createProducto(payload).subscribe({
      next: (res) => {
        this.creandoProducto = false;

        this.cerrarModal();
        this.productoCreado.emit(res.data);

        Swal.fire({
          icon: 'success',
          title: 'Producto creado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: () => {
        this.creandoProducto = false;
        Swal.fire('Error', 'Error al crear producto', 'error');
      }
    });
  }
}
