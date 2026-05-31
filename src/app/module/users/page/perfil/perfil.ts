import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user-service';
import { AuthService } from '../../../auth/service/auth-service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilUsuarioComponent {
  perfilForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      clave: ['']
    });
    this.cargarDatosDesdeToken();
  }

  cargarDatosDesdeToken() {
    const token = this.authService["getDecodedToken"]?.();
    if (!token) {
      this.errorMessage = 'No se pudo cargar la información del usuario.';
      return;
    }
    this.perfilForm.patchValue({
      nombre: token.nombre || '',
      direccion: token.direccion || '',
      telefono: token.telefono || ''
    });
  }

  onSubmit() {
    if (this.perfilForm.invalid) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const userId = this.authService.getUserId();
    if (!userId) return;
    const form = this.perfilForm.value;
    const datos: any = {
      nombres: form.nombre,
      direccion: form.direccion,
      telefono: form.telefono,
    };
    if (form.clave) {
      datos.clave = form.clave;
    }
    this.userService.updateUser(userId, datos).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado correctamente.';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al actualizar el perfil.';
        this.loading = false;
      }
    });
  }
}
