import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import { map } from 'rxjs/operators';

import {
  ProductoCreateRequest,
  ProductosResponse
} from '../model/productos.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  // ================================
  // ⭐ LISTAR PRODUCTOS POR EMPRESA
  // ================================
getProductosByEmpresa(
  empresaId: number,
  page: number = 0,
  size: number = 10,
  filtros?: {
    nombre?: string;
    estado?: string;
    categoria?: string;
    proveedor?: string;
  }
): Observable<any> {

  const headers = this.headerUtil.getAuthHeaders();

  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  if (filtros?.nombre?.trim()) {
    params = params.set('nombre', filtros.nombre.trim());
  }

  if (filtros?.estado) {
    params = params.set('estado', filtros.estado);
  }

  if (filtros?.categoria) {
    params = params.set('categoria', filtros.categoria);
  }

  if (filtros?.proveedor) {
    params = params.set('proveedor', filtros.proveedor);
  }

  const url = `${environment.productosApi}/empresa/${empresaId}`;

  return this.http.get<any>(url, { headers, params }).pipe(
    map(res => res?.data ?? res),
    catchError(err => {
      console.error('Error al obtener productos:', err);
      return throwError(() => err);
    })
  );
}



  createProducto(producto: ProductoCreateRequest): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();

    return this.http.post(
      `${environment.productosApi}/crear-producto`,
      producto,
      { headers }
    );
  }

    updateProducto(id: number, producto: any): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.productosApi}/update-producto/${id}`;

    return this.http
      .put<any>(url, producto, { headers })
      .pipe(
        map(res => res),
        catchError(err => {
          console.error('Error al actualizar producto:', err);
          return throwError(() => err);
        })
      );
  }


  deleteProducto(id: number): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.productosApi}/delete-producto/${id}`;

    return this.http.delete<any>(url, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.error('Error al eliminar producto:', err);
        return throwError(() => err);
      })
    );
  }

}
