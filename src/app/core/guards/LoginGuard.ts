import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../module/auth/service/auth-service';


@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      console.log('✅ Usuario ya autenticado, redirigiendo a dashboard');
      this.router.navigate(['/home/dashboard'], { replaceUrl: true });
      return false;
    }

    return true;
  }
}
