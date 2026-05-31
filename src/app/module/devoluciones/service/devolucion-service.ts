import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import { DevolucionRequest, DevolucionResponse, DevolucionApiResponse } from '../model/devolucion.model';

@Injectable({
  providedIn: 'root'
})
export class DevolucionService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  registrarDevolucion(dto: DevolucionRequest): Observable<DevolucionResponse> {
    return this.http.post<DevolucionResponse>(
      `${environment.devolucionesApi}/registrar`,
      dto,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  listarPorEmpresa(
    empresaId: number,
    page: number = 0,
    size: number = 10,
    ventaId?: number | null,
    usuarioId?: number | null
  ): Observable<DevolucionApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (ventaId !== null && ventaId !== undefined) {
      params = params.set('ventaId', ventaId.toString());
    }
    if (usuarioId !== null && usuarioId !== undefined) {
      params = params.set('usuarioId', usuarioId.toString());
    }
    return this.http.get<DevolucionApiResponse>(
      `${environment.devolucionesApi}/empresa/${empresaId}`,
      {
        headers: this.headerUtil.getAuthHeaders(),
        params
      }
    );
  }

  listarPorUsuario(
    empresaId: number,
    usuarioId: number,
    page: number = 0,
    size: number = 10,
    ventaId?: number | null
  ): Observable<DevolucionApiResponse> {
    return this.listarPorEmpresa(empresaId, page, size, ventaId, usuarioId);
  }
}
