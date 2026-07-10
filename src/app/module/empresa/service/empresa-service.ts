import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl = environment.empresasApi || '/api/empresas';

  constructor(private http: HttpClient) {}

  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  actualizarEmpresa(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-empresa/${id}`, data);
  }

  crearEmpresa(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear-empresa`, data);
  }

  obtenerCorreoFacturacion(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/correo-facturacion`);
  }

  guardarCorreoFacturacion(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/correo-facturacion`, data);
  }
}
