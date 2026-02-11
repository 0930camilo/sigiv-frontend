import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { HeaderTokenUtil } from '../../../../../shared/services/header-token-util';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor(
    private http: HttpClient,
    private headerUtil: HeaderTokenUtil
  ) {}

  /** 🔹 Usuarios activos */
  getUsuariosActivos(idEmpresa: number): Observable<number> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.empresasApi}/${idEmpresa}/usuarios-activos`;
    return this.http.get<any>(url, { headers }).pipe(
      map(response => Number(response.data ?? 0)),
      catchError((err: any) => {
        console.error('❌ Error al obtener usuarios activos:', err);
        return throwError(() => err);
      })
    );
  }

  /** 🔹 Total vendido */
  getTotalVendido(idEmpresa: number): Observable<number> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.empresasApi}/${idEmpresa}/total-vendido`;
    return this.http.get<any>(url, { headers }).pipe(
      map(response => Number(response.data ?? 0)),
      catchError((err: any) => {
        console.error('❌ Error al obtener total vendido:', err);
        return throwError(() => err);
      })
    );
  }

  /** 🔹 Total vendido entre fechas */
  getTotalVendidoEntreFechas(idEmpresa: number, fechaInicio: string, fechaFin: string): Observable<number> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.empresasApi}/${idEmpresa}/total-vendido-rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get<any>(url, { headers }).pipe(
      map(response => Number(response.data ?? 0)),
      catchError((err: any) => {
        console.error('❌ Error al obtener total vendido entre fechas:', err);
        return throwError(() => err);
      })
    );
  }

  /** 🔹 Ganancia total por empresa */
  getGananciaTotal(idEmpresa: number): Observable<number> {
    const headers = this.headerUtil.getAuthHeaders();
    const url = `${environment.empresasApi}/ganancia/empresa/${idEmpresa}`;
    return this.http.get<any>(url, { headers }).pipe(
      map(response => Number(response.data ?? 0)),
      catchError((err: any) => {
        console.error('❌ Error al obtener ganancia total:', err);
        return throwError(() => err);
      })
    );
  }

  // ===============================
// 🏭 PRODUCTOS POR PROVEEDOR
// ===============================
getProductosByProveedor(
  idEmpresa: number,
  idProveedor: number
): Observable<any> {

  const headers = this.headerUtil.getAuthHeaders();
  const url = `${environment.empresasApi}/${idEmpresa}/productos/proveedor/${idProveedor}`;

  return this.http.get<any>(url, { headers }).pipe(
    map(res => res),
    catchError(err => {
      console.error('❌ Error al listar productos por proveedor:', err);
      return throwError(() => err);
    })
  );
}
getProductosByCategoria(
  idEmpresa: number,
  idCategoria: number
): Observable<any> {

  const headers = this.headerUtil.getAuthHeaders();
  const url = `${environment.empresasApi}/${idEmpresa}/productos/categoria/${idCategoria}`;
  return this.http.get<any>(url, { headers }).pipe(
    map(res => res),
    catchError(err => {
      console.error('❌ Error al listar productos por categoría:', err);
      return throwError(() => err);
    })
  );
}

}
