import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { UsuarioCreateRequest, UsuarioCreateResponse, UsuarioDeleteResponse, UsuariosResponse, UsuarioUpdateRequest, UsuarioUpdateResponse } from '../model/user.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../auth/service/auth-service';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) { }

  getUsersByEmpresa(
    empresaId: number,
    page = 0,
    size = 10,
    estado?: string,
    nombres?: string,
    documento?: string
  ): Observable<UsuariosResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (estado) {
      params = params.set('estado', estado);
    }
    if (nombres) {
      params = params.set('nombres', nombres);
    }
    if (documento) {
      params = params.set('documento', documento);
    }
    const headers = this.headerUtil.getAuthHeaders();
    return this.http
      .get<UsuariosResponse>(`${environment.usersApi}/empresa/${empresaId}/list-users`, { headers, params })
      .pipe(
        map(res => res),
        catchError(err => {
          console.error('Error al obtener usuarios:', err);
          return throwError(() => err);
        })
      );
  }

  createUser(usuario: UsuarioCreateRequest): Observable<UsuarioCreateResponse> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.usersApi}/crear-usuarios`;
    return this.http
      .post<UsuarioCreateResponse>(url, usuario, { headers })
      .pipe(
        map(res => res),
        catchError(err => {
          console.error('Error al crear usuario:', err);
          return throwError(() => err);
        })
      );
  }

  updateUser(id: number, usuario: UsuarioUpdateRequest): Observable<UsuarioUpdateResponse> {
    const headers = this.headerUtil.getAuthHeaders();
    return this.http
      .put<UsuarioUpdateResponse>(`${environment.usersApi}/update-user/${id}`, usuario, { headers })
      .pipe(
        catchError(err => {
          console.error('Error al actualizar usuario:', err);
          return throwError(() => err);
        })
      );
  }

  deleteUser(id: number): Observable<UsuarioDeleteResponse> {
    const headers = this.headerUtil.getAuthHeaders();
    return this.http
      .delete<UsuarioDeleteResponse>(`${environment.usersApi}/delete-user/${id}`, { headers })
      .pipe(
        catchError(err => {
          console.error('Error al eliminar usuario:', err);
          return throwError(() => err);
        })
      );
  }

}
