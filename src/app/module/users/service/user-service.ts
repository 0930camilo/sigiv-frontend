import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { UsuarioCreateRequest, UsuarioCreateResponse, UsuariosResponse } from '../model/user.model';
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

  getUsersByEmpresa(empresaId: number, page = 0, size = 10): Observable<UsuariosResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
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

}
