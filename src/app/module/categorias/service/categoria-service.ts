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
    size = 10,
    estado?: string,
    nombre?: string
  ): Observable<CategoriasResponse> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (estado) {
      params = params.set('estado', estado);
    }

    if (nombre && nombre.trim() !== '') {
      params = params.set('nombre', nombre);
    }

    const headers = this.headerUtil.getAuthHeaders();

    return this.http.get<CategoriasResponse>(
      `${environment.categoriasApi}/empresa/${empresaId}`,
      { headers, params }
    ).pipe(
      catchError(err => {
        console.error('Error al obtener categorias:', err);
        return throwError(() => err);
      })
    );
  }

  createCategoria(
    categoria: CategoriaCreateRequest
  ): Observable<CategoriaCreateResponse> {

    const headers = this.headerUtil.getAuthHeaders();

    return this.http.post<CategoriaCreateResponse>(
      `${environment.categoriasApi}/crear-categoria`,
      categoria,
      { headers }
    );
  }

  updateCategoria(id: number, categoria: CategoriaCreateRequest): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();

    return this.http.put(
      `${environment.categoriasApi}/update-categoria/${id}`,
      categoria,
      { headers }
    );
  }

  deleteCategoria(id: number): Observable<any> {
    const headers = this.headerUtil.getAuthHeaders();

    return this.http.delete(
      `${environment.categoriasApi}/delete-categoria/${id}`,
      { headers }
    );
  }
}
