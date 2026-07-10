import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EmpresaService } from '../../../empresa/service/empresa-service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  empresaForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private router: Router
  ) {
    this.empresaForm = this.fb.group({
      nombre_empresa: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nit: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      clave: ['', Validators.required]
    });
  }

  registrarEmpresa(): void {
    if (this.empresaForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    const form = this.empresaForm.value;
    const payload = {
      nombre_empresa: form.nombre_empresa,
      clave: form.clave,
      nit: form.nit,
      telefono: Number(form.telefono),
      direccion: form.direccion,
      correo: form.correo,
      estado: 'Inactivo'
    };

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.empresaService.crearEmpresa(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Empresa registrada. Queda pendiente de activacion por el administrador.';
        this.empresaForm.reset();
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'No se pudo registrar la empresa. Intenta nuevamente.';
      }
    });
  }

}
