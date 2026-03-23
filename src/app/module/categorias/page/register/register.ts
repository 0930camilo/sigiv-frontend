import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CategoriaService } from '../../service/categoria-service';
import { CategoriaCreateRequest } from '../../model/categorias.model';

@Component({
  selector: 'app-register-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterCategoria {
  @Input() empresaId!: number | null;
  @Output() categoriaCreada = new EventEmitter<any>();

  mostrarModal = false;
  creandoCategoria = false;
  formCategoria!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.formCategoria = this.fb.group({
      nombre: ['', Validators.required],
      estado: ['Activo', Validators.required],
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.formCategoria.reset({ estado: 'Activo' });
  }

  crearCategoria(): void {
    if (!this.empresaId || this.formCategoria.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos requeridos.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const payload: CategoriaCreateRequest = {
      ...this.formCategoria.value,
      empresaId: this.empresaId
    };

    this.creandoCategoria = true;

    this.categoriaService.createCategoria(payload).subscribe({
      next: (res) => {
        this.creandoCategoria = false;
        this.cerrarModal();
        this.categoriaCreada.emit(res.data || null);
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'success',
          title: 'Categoria creada',
          text: 'La categoria se registró correctamente.',
          confirmButtonColor: '#2563eb',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al crear categoria:', err);
        this.creandoCategoria = false;
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la categoria. Intenta nuevamente.',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}
