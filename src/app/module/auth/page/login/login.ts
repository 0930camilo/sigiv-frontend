import { Loaderservice } from './../../../../core/services/loaderservice';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loader: Loaderservice,
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      clave: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.loader.show();

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('✅ Login response:', response);

        if (response.success) {
          console.log('🔄 Redirigiendo al dashboard...');
          this.authService.redirectToDashboard();
          setTimeout(() => {
            this.loader.hide();
            this.loading = false;
          }, 300);
        }
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.loader.hide();
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }

  clearError(): void {
    this.errorMessage = '';
  }

}
