
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
import { Abono, AbonoRequest, VentaRequest, VentasResponse } from '../model/venta.model';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  crearVenta(venta: VentaRequest): Observable<any> {
    return this.http.post(
      `${environment.ventasApi}/crear-venta`,
      venta,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  getVentasByEmpresa(
    empresaId: number,
    page = 0,
    size = 10,
    idVenta?: number | null,
    fechaInicio?: string,
    fechaFin?: string,
    cliente?: string
  ): Observable<VentasResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (idVenta !== null && idVenta !== undefined) {
      params = params.set('idVenta', idVenta.toString());
    }

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (cliente) params = params.set('cliente', cliente);

    return this.http.get<VentasResponse>(
      `${environment.ventasApi}/empresa/${empresaId}/ventas`,
      {
        headers: this.headerUtil.getAuthHeaders(),
        params
      }
    );
  }

  descargarFactura(id: number) {
    return this.http.get(
      `${environment.ventasApi}/${id}/factura`,
      {
        responseType: 'blob',
        headers: this.headerUtil.getAuthHeaders()
      }
    );
  }

  descargarFacturaPos(id: number) {
    return this.http.get(
      `${environment.ventasApi}/${id}/factura-pos`,
      {
        responseType: 'blob',
        headers: this.headerUtil.getAuthHeaders()
      }
    );
  }

  enviarFacturaPorCorreo(id: number, correoDestino: string): Observable<any> {
    return this.http.post(
      `${environment.ventasApi}/${id}/factura/enviar-correo`,
      { correoDestino, formatoFactura: 'POS' },
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  getVentasByUsuario(
    usuarioId: number,
    page: number = 0,
    size: number = 10,
    idVenta?: number | null,
    fechaInicio?: string,
    fechaFin?: string,
    cliente?: string
  ): Observable<VentasResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (idVenta !== null && idVenta !== undefined) {
      params = params.set('idVenta', idVenta.toString());
    }

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (cliente) params = params.set('cliente', cliente);

    return this.http.get<VentasResponse>(
      `${environment.ventasApi}/usuario/${usuarioId}/ventas`,
      {
        headers: this.headerUtil.getAuthHeaders(),
        params
      }
    );
  }

  registrarAbono(ventaId: number, abono: AbonoRequest): Observable<ApiResponse<Abono>> {
    return this.http.post<ApiResponse<Abono>>(
      `${environment.ventasApi}/${ventaId}/abonos`,
      abono,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }

  getAbonosByVentaId(ventaId: number): Observable<ApiResponse<Abono[]>> {
    return this.http.get<ApiResponse<Abono[]>>(
      `${environment.ventasApi}/${ventaId}/abonos`,
      { headers: this.headerUtil.getAuthHeaders() }
    );
  }


}
