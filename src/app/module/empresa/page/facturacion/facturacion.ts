import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpresaService } from '../../service/empresa-service';
import { AuthService } from '../../../auth/service/auth-service';

@Component({
  selector: 'app-facturacion-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facturacion.html',
  styleUrls: ['./facturacion.scss']
})
export class FacturacionEmpresaComponent {
  facturacionForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private authService: AuthService
  ) {
    this.facturacionForm = this.fb.group({
      correoFacturacion: ['', Validators.email],
      claveAplicacion: [''],
      smtpHost: ['smtp.gmail.com'],
      smtpPort: [587],
      startTls: [true]
    });

    this.cargarCorreoFacturacion();
  }

  cargarCorreoFacturacion(): void {
    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) {
      this.errorMessage = 'No se pudo identificar la empresa.';
      return;
    }

    this.empresaService.obtenerCorreoFacturacion(empresaId).subscribe({
      next: (response) => {
        const configuracion = response?.data ?? response;
        this.facturacionForm.patchValue({
          correoFacturacion: configuracion?.correo || '',
          smtpHost: configuracion?.smtpHost || 'smtp.gmail.com',
          smtpPort: configuracion?.smtpPort || 587,
          startTls: configuracion?.startTls ?? true
        });
      },
      error: () => {
        this.facturacionForm.patchValue({
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          startTls: true
        });
      }
    });
  }

  onSubmit(): void {
    if (this.facturacionForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) {
      this.errorMessage = 'No se pudo identificar la empresa.';
      this.loading = false;
      return;
    }

    const form = this.facturacionForm.value;
    const claveAplicacion = form.claveAplicacion?.trim();
    const datosCorreo: any = {
      correo: form.correoFacturacion?.trim(),
      smtpHost: form.smtpHost?.trim() || 'smtp.gmail.com',
      smtpPort: form.smtpPort ? Number(form.smtpPort) : 587,
      startTls: form.startTls ?? true
    };

    if (claveAplicacion) {
      datosCorreo.claveAplicacion = claveAplicacion;
    }

    this.empresaService.guardarCorreoFacturacion(empresaId, datosCorreo).subscribe({
      next: () => {
        this.successMessage = 'Correo de facturacion actualizado correctamente.';
        this.loading = false;
        this.facturacionForm.patchValue({ claveAplicacion: '' });
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar el correo de facturacion.';
        this.loading = false;
      }
    });
  }
}
