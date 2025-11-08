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
    this.loader.show();

    return next.handle(request).pipe(
      finalize(() => this.loader.hide())
    );
  }
}
