import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FiltrosCotizacion {
  idCotizacion?: number | null;
  nombreCliente?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

@Component({
  selector: 'app-filtros-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">

      <!-- ID -->
      <input
        type="number"
        placeholder="ID"
        class="border rounded-lg px-3 py-2 w-full"
        [(ngModel)]="filtros.idCotizacion"
      />

      <!-- Cliente -->
      <input
        type="text"
        placeholder="Cliente"
        class="border rounded-lg px-3 py-2 w-full"
        [(ngModel)]="filtros.nombreCliente"
      />

      <!-- Fecha Inicio -->
      <input
        type="date"
        class="border rounded-lg px-3 py-2 w-full"
        [(ngModel)]="filtros.fechaInicio"
      />

      <!-- Fecha Fin -->
      <input
        type="date"
        class="border rounded-lg px-3 py-2 w-full"
        [(ngModel)]="filtros.fechaFin"
      />

      <!-- Botones -->
      <div class="grid grid-cols-2 gap-2 col-span-2 lg:col-span-1">
        <button
          class="bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
          (click)="buscar()">
          Buscar
        </button>

        <button
          class="bg-gray-300 rounded-lg py-2 hover:bg-gray-400"
          (click)="limpiar()">
          Limpiar
        </button>
      </div>

    </div>
  `
})
export class FiltrosCotizacionesComponent {
  filtros: FiltrosCotizacion = {};
  @Output() filtrar = new EventEmitter<FiltrosCotizacion>();

  buscar() {
    this.filtrar.emit(this.filtros);
  }

  limpiar() {
    this.filtros = {};
    this.filtrar.emit(this.filtros);
  }
}
