import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import { map } from 'rxjs/operators';

import {
  ProductoCreateRequest,
  ProductoImportResultDto,
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
    codigoBarra?: string;
    estado?: string;
    categoria?: string;
    proveedor?: string;
  }
): Observable<any> {

  const headers = this.headerUtil.getAuthHeaders();

  let params = new HttpParams()
    .set('page', page)
    .set('size', size);

  if (filtros?.nombre) {
    params = params.set('nombre', filtros.nombre);
  }

  if (filtros?.codigoBarra) {
    params = params.set('codigoBarra', filtros.codigoBarra);
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

  return this.http
    .get<any>(`${environment.productosApi}/empresa/${empresaId}`, { headers, params })
    .pipe(
      map(res => res.data), // 🔥 SIEMPRE data
      catchError(err => {
        console.error(err);
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

  importarProductosExcel(archivo: File): Observable<ProductoImportResultDto> {
    const headers = this.headerUtil.getAuthHeadersForFormData();
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http
      .post<ProductoImportResultDto>(`${environment.productosApi}/importar-excel`, formData, { headers })
      .pipe(
        catchError(err => {
          console.error('Error al importar productos:', err);
          return throwError(() => err);
        })
      );
  }

  getPlantillaProductosPorEmpresa(empresaId: number): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();

    return this.http
      .get<any>(`${environment.productosApi}/plantilla/empresa/${empresaId}`, { headers })
      .pipe(
        catchError(err => {
          console.error('Error al obtener plantilla de productos:', err);
          return throwError(() => err);
        })
      );
  }

  getCodigoBarraImagen(codigoBarra: string): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();

    return this.http
      .get<any>(`${environment.productosApi}/codigo-barra/${codigoBarra}/imagen-base64`, { headers })
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('Error al obtener imagen de codigo de barra:', err);
          return throwError(() => err);
        })
      );
  }

}
