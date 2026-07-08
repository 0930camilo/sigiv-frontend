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
      correo: ['', [Validators.required, Validators.email]],
      nit: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      clave: ['']
    });
    this.cargarDatosEmpresa();
  }

  cargarDatosEmpresa() {
    const tokenPayload = this.authService.getUserData();
    if (!tokenPayload) {
      this.errorMessage = 'No se pudo cargar la informacion de la empresa.';
      return;
    }

    this.perfilForm.patchValue({
      nombre: tokenPayload.nombre_empresa || tokenPayload.nombre || '',
      correo: tokenPayload.correo || '',
      nit: tokenPayload.nit || '',
      direccion: tokenPayload.direccion || '',
      telefono: tokenPayload.telefono || ''
    });

    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) return;

    this.empresaService.obtenerPorId(empresaId).subscribe({
      next: (response) => {
        const empresa = response?.data ?? response;
        this.perfilForm.patchValue({
          nombre:
            empresa?.nombre_empresa ||
            empresa?.nombre ||
            tokenPayload.nombre_empresa ||
            tokenPayload.nombre ||
            '',
          correo: empresa?.correo || tokenPayload.correo || '',
          nit: empresa?.nit || tokenPayload.nit || '',
          direccion: empresa?.direccion || tokenPayload.direccion || '',
          telefono: empresa?.telefono || tokenPayload.telefono || ''
        });
      },
      error: () => {
        // Se conserva la informacion del token si no se puede consultar el detalle.
      }
    });

  }

  onSubmit() {
    if (this.perfilForm.invalid) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) {
      this.errorMessage = 'No se pudo identificar la empresa.';
      this.loading = false;
      return;
    }
    const form = this.perfilForm.value;
    const datos: any = {
      nombre_empresa: form.nombre,
      correo: form.correo,
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
        this.perfilForm.patchValue({ clave: '' });
      },
      error: () => {
        this.errorMessage = 'Error al actualizar el perfil.';
        this.loading = false;
      }
    });
  }

}
