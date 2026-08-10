import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PorcentajeRequestDto {
    valor: number;
    porcentaje: number;
}

export interface ReglaDeTresRequestDto {
    a: number;
    b: number;
    c: number;
}

export interface CalculadoraResponseDto {
    resultado: number;
    operacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalculadoraService {
  private apiUrl = environment.calculadoraApi;

  constructor(private http: HttpClient) {}

  calcularPorcentaje(dto: PorcentajeRequestDto): Observable<CalculadoraResponseDto> {
    return this.http.post<CalculadoraResponseDto>(`${this.apiUrl}/porcentaje`, dto);
  }

  calcularReglaDeTres(dto: ReglaDeTresRequestDto): Observable<CalculadoraResponseDto> {
    return this.http.post<CalculadoraResponseDto>(`${this.apiUrl}/regla-de-tres`, dto);
  }
}
