import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import { DevolucionRequest, DevolucionResponse } from '../model/devolucion.model';

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

  listarPorEmpresa(empresaId: number, ventaId?: number | null): Observable<DevolucionResponse[]> {
    let params = new HttpParams();
    if (ventaId !== null && ventaId !== undefined) {
      params = params.set('ventaId', ventaId.toString());
    }
    return this.http.get<DevolucionResponse[]>(
      `${environment.devolucionesApi}/empresa/${empresaId}`,
      {
        headers: this.headerUtil.getAuthHeaders(),
        params
      }
    );
  }
}
