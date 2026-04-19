import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import {
  NominaApiResponse,
  NominaSingleResponse,
  NominaRequest,
  PersonaNominaApiResponse,
  PersonaNominaSingleResponse,
  PersonaNominaRequest
} from '../model/nomina.model';

@Injectable({
  providedIn: 'root'
})
export class NominaService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  listarPorEmpresa(empresaId: number, page: number = 0, size: number = 10): Observable<NominaApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<NominaApiResponse>(
      `${environment.nominasApi}/empresa/${empresaId}`,
      { headers: this.headerUtil.getAuthHeaders(), params }
    );
  }

  crearNomina(dto: NominaRequest): Observable<NominaSingleResponse> {
    return this.http.post<NominaSingleResponse>(
      `${environment.nominasApi}/crear-nomina`,
      dto,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  actualizarNomina(id: number, dto: NominaRequest): Observable<NominaSingleResponse> {
    return this.http.put<NominaSingleResponse>(
      `${environment.nominasApi}/actualizar/${id}`,
      dto,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  eliminarNomina(id: number): Observable<any> {
    return this.http.delete(
      `${environment.nominasApi}/eliminar/${id}`,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  cambiarEstado(id: number): Observable<NominaSingleResponse> {
    return this.http.put<NominaSingleResponse>(
      `${environment.nominasApi}/cambiar-estado/${id}`,
      {},
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  // --- PersonaNomina ---

  listarPersonaNomina(nominaId: number): Observable<PersonaNominaApiResponse> {
    return this.http.get<PersonaNominaApiResponse>(
      `${environment.personaNominaApi}/nomina/${nominaId}`,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  crearPersonaNomina(dto: PersonaNominaRequest): Observable<PersonaNominaSingleResponse> {
    return this.http.post<PersonaNominaSingleResponse>(
      `${environment.personaNominaApi}/crear`,
      dto,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  eliminarPersonaNomina(idPersona: number): Observable<any> {
    return this.http.delete(
      `${environment.personaNominaApi}/eliminar/${idPersona}`,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }
}
