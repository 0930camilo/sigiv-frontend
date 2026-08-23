import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculadoraResponseDto, CalculadoraService, PorcentajeRequestDto, ReglaDeTresRequestDto } from '../../../shared/services/calculadora.service';

@Component({
  selector: 'app-calculadora-flotante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora-flotante.html',
  styleUrl: './calculadora-flotante.scss'
})
export class CalculadoraFlotante {
  isOpen = false;
  activeTab: 'porcentaje' | 'regla' = 'porcentaje';

  // Porcentaje
  valorP: number | null = null;
  porcentajeP: number | null = null;
  resultadoP: number | null = null;

  // Regla de tres
  valorA: number | null = null;
  valorB: number | null = null;
  valorC: number | null = null;
  resultadoR: number | null = null;

  loading = false;
  error: string | null = null;
  copiado = false;

  constructor(private calculadoraService: CalculadoraService) {}

  toggleCalculadora() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.reset();
    }
  }

  setTab(tab: 'porcentaje' | 'regla') {
    this.activeTab = tab;
    this.error = null;
    this.copiado = false;
  }

  calcularPorcentaje() {
    if (this.valorP === null || this.porcentajeP === null) {
      this.error = 'Complete todos los campos';
      return;
    }

    this.loading = true;
    this.error = null;
    this.copiado = false;

    const dto: PorcentajeRequestDto = {
      valor: this.valorP,
      porcentaje: this.porcentajeP
    };

    this.calculadoraService.calcularPorcentaje(dto).subscribe({
      next: (res: CalculadoraResponseDto) => {
        this.resultadoP = res.resultado;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al calcular';
        this.loading = false;
      }
    });
  }

  calcularRegla() {
    if (this.valorA === null || this.valorB === null || this.valorC === null) {
      this.error = 'Complete todos los campos';
      return;
    }

    if (this.valorA === 0) {
      this.error = 'El primer valor no puede ser 0';
      return;
    }

    this.loading = true;
    this.error = null;
    this.copiado = false;

    const dto: ReglaDeTresRequestDto = {
      a: this.valorA,
      b: this.valorB,
      c: this.valorC
    };

    this.calculadoraService.calcularReglaDeTres(dto).subscribe({
      next: (res: CalculadoraResponseDto) => {
        this.resultadoR = res.resultado;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al calcular';
        this.loading = false;
      }
    });
  }

  copyToClipboard(valor: number | null) {
    if (valor === null) return;

    // Formatear el número según el locale para que sea consistente
    const formatted = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    }).format(valor);

    navigator.clipboard.writeText(formatted).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000);
    });
  }

  reset() {
    this.valorP = null;
    this.porcentajeP = null;
    this.resultadoP = null;
    this.valorA = null;
    this.valorB = null;
    this.valorC = null;
    this.resultadoR = null;
    this.error = null;
    this.copiado = false;
  }
}
