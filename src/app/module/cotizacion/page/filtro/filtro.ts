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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
      <input
        type="number"
        placeholder="ID"
        class="border rounded px-3 py-2 w-full"
        [(ngModel)]="filtros.idCotizacion"
      />
      <input
        type="text"
        placeholder="Cliente"
        class="border rounded px-3 py-2 w-full"
        [(ngModel)]="filtros.nombreCliente"
      />
      <input
        type="date"
        placeholder="Fecha Inicio"
        class="border rounded px-3 py-2 w-full"
        [(ngModel)]="filtros.fechaInicio"
      />
      <input
        type="date"
        placeholder="Fecha Fin"
        class="border rounded px-3 py-2 w-full"
        [(ngModel)]="filtros.fechaFin"
      />
      <div class="flex gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-1">
        <button class="bg-blue-600 text-white px-4 py-2 rounded flex-1" (click)="buscar()">Buscar</button>
        <button class="bg-gray-300 text-black px-4 py-2 rounded flex-1" (click)="limpiar()">Limpiar</button>
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
