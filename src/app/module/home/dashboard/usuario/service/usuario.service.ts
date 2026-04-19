import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { HeaderTokenUtil } from '../../../../../shared/services/header-token-util';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}



  /** 🔹 Total vendido */
  getTotalVendido(idUsuario: number): Observable<number> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.usersApi}/${idUsuario}/total-vendido`;
    return this.http.get<any>(url, { headers }).pipe(
      map(response => Number(response.data ?? 0)),
      catchError((err: any) => {
        console.error('❌ Error al obtener total vendido:', err);
        return throwError(() => err);
      })
    );
  }

  /** 🔹 Total vendido entre fechas */
  getTotalVendidoEntreFechas(idUsuario: number, fechaInicio: string, fechaFin: string): Observable<number> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.usersApi}/${idUsuario }/total-vendido-rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get<any>(url, { headers }).pipe(
      map(response => Number(response.data ?? 0)),
      catchError((err: any) => {
        console.error('❌ Error al obtener total vendido entre fechas:', err);
        return throwError(() => err);
      })
    );
  }

  /** ✅ Ganancia total por usuario (corregido) */
  getGananciaTotal(idUsuario: number, fechaInicio?: string, fechaFin?: string): Observable<number> {
    const headers = this.headerUtil.getAuthHeaders();
    let url = `${environment.usersApi}/ganancia/usuario/${idUsuario}`;
    if (fechaInicio && fechaFin) {
      url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }
    return this.http.get<any>(url, { headers }).pipe(
      map(response => Number(response.data ?? 0)), // ✅ tu backend usa "data"
      catchError((err: any) => {
        console.error('❌ Error al obtener ganancia total:', err);
        return throwError(() => err);
      })
    );
  }
}
