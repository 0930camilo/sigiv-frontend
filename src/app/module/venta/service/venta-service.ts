  import { Injectable } from '@angular/core';
  import { HttpClient, HttpParams } from '@angular/common/http';
  import { Observable, throwError, catchError } from 'rxjs';
  import { environment } from '../../../../environments/environment';
  import { HeaderTokenUtil } from '../../../shared/services/header-token-util';
  import { VentasResponse } from '../model/venta.model';
@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  getVentasByEmpresa(
    empresaId: number,
    page = 0,
    size = 10
  ): Observable<VentasResponse> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    const headers = this.headerUtil.getAuthHeaders();

    return this.http.get<VentasResponse>(
      `http://localhost:8080/ventas/empresa/${empresaId}/ventas`,
      { headers, params }
    );
  }
}
