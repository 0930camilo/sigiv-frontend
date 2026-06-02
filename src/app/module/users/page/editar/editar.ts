import { ChangeDetectorRef, Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../../service/user-service';
import { Usuario } from '../../model/user.model';

@Component({
  selector: 'app-edit-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class EditarUsuarioComponent implements OnChanges {

  @Input() usuario!: Usuario;
  @Output() usuarioActualizado = new EventEmitter<Usuario>();
  @Output() cerrar = new EventEmitter<void>();

  formEdit!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private userService: UserService, private cdr: ChangeDetectorRef) {
    this.formEdit = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      nombres: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      direccion: ['', Validators.required],
      clave: [''],
      estado: ['Activo', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      this.formEdit.patchValue(this.usuario);
    }
  }

  guardarCambios() {
    if (!this.usuario || this.formEdit.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completa todos los campos antes de guardar.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    this.loading = true;

    const form = this.formEdit.value;
    const payload: any = {
      documento: form.documento,
      nombres: form.nombres,
      telefono: form.telefono,
      direccion: form.direccion,
      estado: form.estado,
      empresaId: this.usuario.empresaId
    };
    if (form.clave) {
      payload.clave = form.clave;
    }

    this.userService.updateUser(this.usuario.idUsuario, payload)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.cdr.markForCheck();

          Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            text: 'Los cambios se guardaron correctamente.',
            timer: 1600,
            showConfirmButton: false
          });

          this.usuarioActualizado.emit(res.data);
          this.cerrar.emit();
        },
        error: (err) => {
          this.loading = false;
          this.cdr.markForCheck();
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el usuario.',
            confirmButtonColor: '#ef4444'
          });
        }
      });
  }
}
