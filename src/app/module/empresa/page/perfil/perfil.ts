import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmpresaService } from '../../service/empresa-service';
import { AuthService } from '../../../auth/service/auth-service';

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilEmpresaComponent {
  perfilForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private authService: AuthService
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      nit: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      clave: ['']
    });
    this.cargarDatosDesdeToken();
  }

  cargarDatosDesdeToken() {
    const tokenPayload = this.authService["getDecodedToken"]?.();
    if (!tokenPayload) {
      this.errorMessage = 'No se pudo cargar la información de la empresa.';
      return;
    }
    this.perfilForm.patchValue({
      nombre: tokenPayload.nombre_empresa || tokenPayload.nombre || '',
      nit: tokenPayload.nit || '',
      direccion: tokenPayload.direccion || '',
      telefono: tokenPayload.telefono || ''
    });
  }

  onSubmit() {
    if (this.perfilForm.invalid) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) return;
    const form = this.perfilForm.value;
    // Construir el objeto solo con los campos requeridos por el backend
    const datos: any = {
      nombre_empresa: form.nombre,
      telefono: form.telefono ? Number(form.telefono) : undefined,
      nit: form.nit,
      direccion: form.direccion
    };
    if (form.clave) {
      datos.clave = form.clave;
    }
    this.empresaService.actualizarEmpresa(empresaId, datos).subscribe({
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
