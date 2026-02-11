import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import {
  ProveedorCreateRequest,
  ProveedorCreateResponse,
  ProveedoresResponse
} from '../model/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  getProveedoresByEmpresa(empresaId: number, page = 0, size = 10): Observable<ProveedoresResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    const headers = this.headerUtil.getAuthHeaders();

   return this.http
  .get<ProveedoresResponse>(
    `${environment.empresasApi}/${empresaId}/proveedores`,
    { headers, params }
  )
      .pipe(
        map(res => res),
        catchError(err => {
          console.error('Error al obtener proveedores:', err);
          return throwError(() => err);
        })
      );
  }



  createProveedor(proveedor: ProveedorCreateRequest): Observable<ProveedorCreateResponse> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.proveedoresApi}/crear-proveedor`;

    return this.http
      .post<ProveedorCreateResponse>(url, proveedor, { headers })
      .pipe(
        map(res => res),
        catchError(err => {
          console.error('Error al crear proveedor:', err);
          return throwError(() => err);
        })
      );
  }

  updateProveedor(id: number, proveedor: any): Observable<any> {
  const headers = this.headerUtil.getAuthHeaders();
  const url = `${environment.proveedoresApi}/update-proveedor/${id}`;

  return this.http
    .put<any>(url, proveedor, { headers })
    .pipe(
      map(res => res),
      catchError(err => {
        console.error('Error al actualizar proveedor:', err);
        return throwError(() => err);
      })
    );
}


deleteProveedor(id: number): Observable<any> {
  const headers = this.headerUtil.getAuthHeaders();
  const url = `${environment.proveedoresApi}/delete-proveedor/${id}`;

  return this.http.delete<any>(url, { headers }).pipe(
    map(res => res),
    catchError(err => {
      console.error('Error al eliminar proveedor:', err);
      return throwError(() => err);
    })
  );
}

 listarPorEstado(estado: string): Observable<{ data: any[] }> {
    const headers = this.headerUtil.getAuthHeaders();
    const params = new HttpParams().set('estado', estado);

    return this.http.get<{ data: any[] }>(
      `${environment.proveedoresApi}/list-proveedor-status`,
      { headers, params }
    );
  }

buscarPorNombre(nombre: string): Observable<any> {
  const headers = this.headerUtil.getAuthHeaders();
  const params = new HttpParams().set('nombre', nombre);

  return this.http
    .get<any>(`${environment.proveedoresApi}/buscar`, { headers, params });
}

getProveedoresByEmpresaP(idEmpresa: number | null): Observable<any[]> {
  const headers = this.headerUtil.getAuthHeaders();

  return this.http.get<any[]>(
    `${environment.proveedoresApi}/empresa/${idEmpresa}`,
    { headers }
  );

}
}


