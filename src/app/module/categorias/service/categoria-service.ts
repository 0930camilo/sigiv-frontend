import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import {
  CategoriaCreateRequest,
  CategoriaCreateResponse,
  CategoriasResponse
} from '../model/categorias.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  getCategoriasByEmpresa(
    empresaId: number,
    page = 0,
    size = 10
  ): Observable<CategoriasResponse> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    const headers = this.headerUtil.getAuthHeaders();

    return this.http
      .get<CategoriasResponse>(
        `${environment.empresasApi}/${empresaId}/categorias`,
        { headers, params }
      )
      .pipe(
        catchError(err => {
          console.error('Error al obtener categorias:', err);
          return throwError(() => err);
        })
      );
  }

  createCategoria(categoria: CategoriaCreateRequest): Observable<CategoriaCreateResponse> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.categoriasApi}/crear-categoria`;

    return this.http
      .post<CategoriaCreateResponse>(url, categoria, { headers })
      .pipe(
        catchError(err => {
          console.error('Error al crear categoria:', err);
          return throwError(() => err);
        })
      );
  }

  updateCategoria(id: number, categoria: any): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.categoriasApi}/update-categoria/${id}`;

    return this.http
      .put<any>(url, categoria, { headers })
      .pipe(
        catchError(err => {
          console.error('Error al actualizar categoria:', err);
          return throwError(() => err);
        })
      );
  }

  deleteCategoria(id: number): Observable<any> {
  const headers = this.headerUtil.getAuthHeaders();
  const url = `${environment.categoriasApi}/delete-categoria/${id}`;

  return this.http.delete<any>(url, { headers }).pipe(
    map(res => res),
    catchError(err => {
      console.error('Error al eliminar categoria:', err);
      return throwError(() => err);
    })
  );
}


 listarPorEstado(estado: string): Observable<{ data: any[] }> {
    const headers = this.headerUtil.getAuthHeaders();
    const params = new HttpParams().set('estado', estado);

    return this.http.get<{ data: any[] }>(
      `${environment.categoriasApi}/list-categoria-status`,
      { headers, params }
    );
  }

buscarPorNombre(nombre: string): Observable<any> {
  const headers = this.headerUtil.getAuthHeaders();
  const params = new HttpParams().set('nombre', nombre);

  return this.http
    .get<any>(`${environment.categoriasApi}/buscar`, { headers, params });
}


getCategoriasByEmpresaP(idEmpresa: number | null): Observable<any[]> {
  const headers = this.headerUtil.getAuthHeaders();

  return this.http.get<any[]>(
    `${environment.categoriasApi}/empresa/${idEmpresa}`,
    { headers }
  );

}
}
