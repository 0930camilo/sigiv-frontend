import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import { CotizacionRequest, CotizacionesResponse } from '../model/cotizacion.model';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  crearCotizacion(cotizacion: CotizacionRequest): Observable<any> {
    return this.http.post(
      `${environment.cotizacionesApi}/crear`,
      cotizacion,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  getCotizacionesByEmpresa(
    empresaId: number,
    page = 0,
    size = 10,
    filtros?: {
      usuarioId?: number | null;
      nombreCliente?: string;
      fechaInicio?: string;
      fechaFin?: string;
    }
  ): Observable<CotizacionesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros?.usuarioId) {
      params = params.set('usuarioId', filtros.usuarioId.toString());
    }
    if (filtros?.nombreCliente?.trim()) {
      params = params.set('nombreCliente', filtros.nombreCliente.trim());
    }
    if (filtros?.fechaInicio?.trim()) {
      params = params.set('fechaInicio', filtros.fechaInicio.trim());
    }
    if (filtros?.fechaFin?.trim()) {
      params = params.set('fechaFin', filtros.fechaFin.trim());
    }

    return this.http.get<CotizacionesResponse>(
      `${environment.cotizacionesApi}/empresa/${empresaId}`,
      {
        headers: this.headerUtil.getAuthHeaders(),
        params
      }
    );
  }

  getCotizacionesByUsuario(
    empresaId: number,
    usuarioId: number,
    page = 0,
    size = 10
  ): Observable<CotizacionesResponse> {
    return this.getCotizacionesByEmpresa(empresaId, page, size, { usuarioId });
  }

  obtenerCotizacion(id: number): Observable<any> {
    return this.http.get(
      `${environment.cotizacionesApi}/${id}`,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  eliminarCotizacion(id: number): Observable<any> {
    return this.http.delete(
      `${environment.cotizacionesApi}/${id}`,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  descargarCotizacionPdf(id: number) {
    return this.http.get(
      `${environment.cotizacionesApi}/${id}/descargar`,
      {
        responseType: 'blob',
        headers: this.headerUtil.getAuthHeaders()
      }
    );
  }
}
