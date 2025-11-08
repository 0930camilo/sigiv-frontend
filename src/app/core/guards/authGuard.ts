import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../../module/auth/service/auth-service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      const expectedRoles = route.data['roles'] as string[];

      if (expectedRoles) {
        const userRole = this.authService.getUserRole();
        if (userRole && expectedRoles.includes(userRole)) {
          return true;
        } else {
          this.authService.redirectToDashboard();
          return false;
        }
      }

      return true;
    }

    // Si no está autenticado, redirigir a login
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
      replaceUrl: true // IMPORTANTE: Reemplazar en historial
    });
    return false;
  }
}
