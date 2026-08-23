import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { Loaderservice } from '../services/loaderservice';


@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loader: Loaderservice) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No mostrar el loader global para peticiones GET normales (que suelen ser las de carga de datos)
    // para evitar el bloqueo total de la pantalla.
    const skipLoader = request.method === 'GET';

    if (!skipLoader) {
      this.loader.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!skipLoader) {
          this.loader.hide();
        }
      })
    );
  }
}
