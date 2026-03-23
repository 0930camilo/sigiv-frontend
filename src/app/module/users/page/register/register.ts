import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../service/user-service';
import { UsuarioCreateRequest } from '../../model/user.model';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
 @Input() empresaId!: number | null;
  @Output() usuarioCreado = new EventEmitter<void>();

  mostrarModal = false;
  creandoUsuario = false;
  formUsuario!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.formUsuario = this.fb.group({
      nombres: ['', Validators.required],
      clave: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      direccion: ['', Validators.required],
      estado: ['Activo', Validators.required],
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.formUsuario.reset({ estado: 'Activo' });
  }

 crearUsuario(): void {
  if (!this.empresaId || this.formUsuario.invalid) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, completa todos los campos requeridos.',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const payload: UsuarioCreateRequest = {
    ...this.formUsuario.value,
    empresaId: this.empresaId
  };

  this.creandoUsuario = true;

  this.userService.createUser(payload).subscribe({
    next: () => {
      this.creandoUsuario = false;
      this.cerrarModal();
      this.usuarioCreado.emit();
      this.cdr.markForCheck();

      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El usuario se registró correctamente.',
        confirmButtonColor: '#2563eb',
        timer: 1800,
        showConfirmButton: false
      });
    },
    error: (err) => {
      console.error('Error al crear usuario:', err);
      this.creandoUsuario = false;
      this.cdr.markForCheck();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el usuario. Intenta nuevamente.',
        confirmButtonColor: '#ef4444'
      });
    }
  });
}


}
