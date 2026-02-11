import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CategoriaService } from '../../service/categoria-service';
import { Categoria } from '../../model/categorias.model';

@Component({
  selector: 'app-edit-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class EditarCategoriaComponent implements OnChanges {

  @Input() categoria!: Categoria;
  @Output() categoriaActualizada = new EventEmitter<Categoria>();
  @Output() cerrar = new EventEmitter<void>();

  formEdit!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) {
    this.formEdit = this.fb.group({
      nombre: ['', Validators.required],
      estado: ['Activo', Validators.required],
    });
  }

  ngOnChanges(): void {
    if (this.categoria) {
      this.formEdit.patchValue(this.categoria);
    }
  }

  guardarCambios() {
    if (this.formEdit.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completa todos los campos antes de guardar.',
      });
      return;
    }

    this.loading = true;

    const payload = this.formEdit.value;

    this.categoriaService.updateCategoria(this.categoria.idCategoria, payload)
      .subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Categoría actualizada',
            text: 'Los cambios se guardaron correctamente.',
            timer: 1500,
            showConfirmButton: false
          });

          this.categoriaActualizada.emit(res.data);
          this.cerrar.emit();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la categoría.',
          });
        },
        complete: () => this.loading = false
      });
  }
}
