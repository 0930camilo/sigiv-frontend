import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaNotificacionService {
  private ventaRegistrada$ = new Subject<void>();

  get onVentaRegistrada$() {
    return this.ventaRegistrada$.asObservable();
  }

  notificarVentaRegistrada(): void {
    this.ventaRegistrada$.next();
  }
}
