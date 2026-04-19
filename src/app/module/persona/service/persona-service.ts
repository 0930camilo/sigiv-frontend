import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import { PersonaRequest, PersonaApiResponse, PersonaSingleResponse } from '../model/persona.model';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  listarPorEmpresa(empresaId: number, page: number = 0, size: number = 10): Observable<PersonaApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PersonaApiResponse>(
      `${environment.personasApi}/empresa/${empresaId}`,
      { headers: this.headerUtil.getAuthHeaders(), params }
    );
  }

  crearPersona(dto: PersonaRequest): Observable<PersonaSingleResponse> {
    return this.http.post<PersonaSingleResponse>(
      `${environment.personasApi}/crear-persona`,
      dto,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  actualizarPersona(id: number, dto: PersonaRequest): Observable<PersonaSingleResponse> {
    return this.http.put<PersonaSingleResponse>(
      `${environment.personasApi}/update-persona/${id}`,
      dto,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  eliminarPersona(id: number): Observable<any> {
    return this.http.delete(
      `${environment.personasApi}/delete-persona/${id}`,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  cambiarEstado(id: number): Observable<PersonaSingleResponse> {
    return this.http.put<PersonaSingleResponse>(
      `${environment.personasApi}/cambiar-estado/${id}`,
      {},
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }
}
