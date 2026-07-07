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
      correoFacturacion: ['', Validators.email],
      claveAplicacion: [''],
      smtpHost: ['smtp.gmail.com'],
      smtpPort: [587],
      startTls: [true],
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

    this.empresaService.obtenerCorreoFacturacion(empresaId).subscribe({
      next: (response) => {
        const configuracion = response?.data ?? response;
        this.perfilForm.patchValue({
          correoFacturacion: configuracion?.correo || '',
          smtpHost: configuracion?.smtpHost || 'smtp.gmail.com',
          smtpPort: configuracion?.smtpPort || 587,
          startTls: configuracion?.startTls ?? true
        });
      },
      error: () => {
        this.perfilForm.patchValue({
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          startTls: true
        });
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
        this.guardarCorreoFacturacion(empresaId, form);
      },
      error: () => {
        this.errorMessage = 'Error al actualizar el perfil.';
        this.loading = false;
      }
    });
  }

  private guardarCorreoFacturacion(empresaId: number, form: any): void {
    const correoFacturacion = form.correoFacturacion?.trim();
    const claveAplicacion = form.claveAplicacion?.trim();
    const smtpHost = form.smtpHost?.trim();
    const smtpPort = form.smtpPort ? Number(form.smtpPort) : undefined;
    const tieneConfiguracionCorreo = !!correoFacturacion || !!claveAplicacion;

    if (!tieneConfiguracionCorreo) {
      this.successMessage = 'Perfil actualizado correctamente.';
      this.loading = false;
      return;
    }

    const datosCorreo: any = {
      correo: correoFacturacion,
      smtpHost: smtpHost || 'smtp.gmail.com',
      smtpPort: smtpPort || 587,
      startTls: form.startTls ?? true
    };

    if (claveAplicacion) {
      datosCorreo.claveAplicacion = claveAplicacion;
    }

    this.empresaService.guardarCorreoFacturacion(empresaId, datosCorreo).subscribe({
      next: () => {
        this.successMessage = 'Perfil y correo de facturacion actualizados correctamente.';
        this.loading = false;
        this.perfilForm.patchValue({ claveAplicacion: '' });
      },
      error: () => {
        this.errorMessage = 'El perfil se actualizo, pero no se pudo guardar el correo de facturacion.';
        this.loading = false;
      }
    });
  }
}
