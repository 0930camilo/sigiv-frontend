import { ChangeDetectorRef, Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProveedorService } from '../../service/proveedor-service';
import { Proveedor } from '../../model/proveedor.model';

@Component({
  selector: 'app-edit-proveedor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class EditarProveedorComponent implements OnChanges {

  @Input() proveedor!: Proveedor;
  @Output() proveedorActualizado = new EventEmitter<Proveedor>();
  @Output() cerrar = new EventEmitter<void>();

  formEdit!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private proveedorService: ProveedorService, private cdr: ChangeDetectorRef) {
    this.formEdit = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      nombre: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      direccion: ['', Validators.required],
      estado: ['Activo', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proveedor'] && this.proveedor) {
      this.formEdit.patchValue(this.proveedor);
    }
  }

  guardarCambios() {
    if (!this.proveedor || this.formEdit.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completa todos los campos antes de guardar.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    this.loading = true;

    const payload = {
      ...this.formEdit.value,
      telefono: Number(this.formEdit.value.telefono)
    };

    this.proveedorService.updateProveedor(this.proveedor.idProveedor, payload)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.proveedorActualizado.emit(res.data);
          this.cerrar.emit();
          this.cdr.markForCheck();

          Swal.fire({
            icon: 'success',
            title: 'Proveedor actualizado',
            text: 'Los cambios se guardaron correctamente.',
            timer: 1600,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.cdr.markForCheck();

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el proveedor.',
            confirmButtonColor: '#ef4444'
          });
        }
      });
  }
}
