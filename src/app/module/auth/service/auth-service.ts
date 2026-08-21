import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, TokenPayload } from '../model/auth.model';
import { BehaviorSubject, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<TokenPayload | null>(this.getDecodedToken());
  public currentUser$ = this.currentUserSubject.asObservable();
  private expirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.scheduleExpirationAlert(this.getDecodedToken());
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authApi}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setToken(response.data.token);
          const decoded = this.getDecodedToken();
          this.currentUserSubject.next(decoded);
          this.scheduleExpirationAlert(decoded);
          console.log('✅ Login exitoso, token guardado');
        }
      })
    );
  }

  private setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  private getDecodedToken(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn('⚠️ Token expirado');
        this.logout();
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return null;
    }
  }

  getUserData(): TokenPayload | null {
    return this.getDecodedToken();
  }

  getUserData$(): Observable<TokenPayload> {
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return throwError(() => new Error('Token inválido o expirado'));
    }
    return of(decoded).pipe(delay(300));
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.getDecodedToken();
    if (!decoded) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  }

  getUserRole(): string | null {
    return this.getDecodedToken()?.rol ?? null;
  }

  getUserName(): string {
    const user = this.getDecodedToken();
    return user?.nombre_empresa || user?.nombre || 'Usuario';
  }

  getEmpresaId(): number | null {
    const decoded = this.getDecodedToken();
    return decoded?.empresa_id ?? decoded?.id ?? null;
  }

  getUserId(): number | null {
    return this.getDecodedToken()?.id ?? null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  logout(): void {
    console.log('🚪 Cerrando sesión...');
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
    }
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  redirectToDashboard(): void {
    const role = this.getUserRole();
    console.log('🔄 Redirigiendo a perfil. Rol:', role);
    const target = role === 'ROLE_USUARIO' ? '/home/perfil-usuario' : '/home/perfil';
    this.router.navigate([target], { replaceUrl: true });
  }

  /** 🔹 Programar alerta de expiración de sesión */
  private scheduleExpirationAlert(payload: TokenPayload | null): void {
    if (!payload || !payload.exp || !this.isBrowser()) return;

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
    }

    const currentTime = Date.now();
    const expirationTime = payload.exp * 1000;
    const timeUntilExpiration = expirationTime - currentTime;

    // Mostrar alerta 2 minutos antes de expirar
    const alertLeadTime = 2 * 60 * 1000;
    const delayUntilAlert = timeUntilExpiration - alertLeadTime;

    if (delayUntilAlert > 0) {
      this.expirationTimer = setTimeout(() => {
        this.showExpirationWarning();
      }, delayUntilAlert);
    } else if (timeUntilExpiration > 0) {
      // Si queda menos de 2 minutos, mostrar alerta inmediatamente
      this.showExpirationWarning();
    }
  }

  private async showExpirationWarning(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      title: '¡Tu sesión está por caducar!',
      text: 'Por seguridad, tu sesión se cerrará en menos de 2 minutos. ¿Deseas continuar conectado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, mantener sesión',
      cancelButtonText: 'Cerrar sesión ahora',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      timer: 120000,
      timerProgressBar: true
    }).then((result) => {
      if (result.isConfirmed) {
        // En un escenario real, aquí llamaríamos a un endpoint de /refresh-token
        // Como no tenemos uno explícito, al menos reseteamos el timer localmente
        // o notificamos que el usuario sigue activo.
        console.log('🔄 Usuario desea continuar. (Idealmente refrescar token aquí)');
      } else if (result.dismiss === Swal.DismissReason.timer || result.isDismissed) {
        this.logout();
      }
    });
  }
}
