import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FiltrosVenta {
  idVenta?: number | null;
  cliente?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

@Component({
  selector: 'app-filtros-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-4">

      <!-- ID -->
      <input
        type="number"
        placeholder="ID Venta"
        class="border rounded-lg px-2 py-1 text-sm w-full h-9"
        [(ngModel)]="filtros.idVenta"
      />

      <!-- Cliente -->
      <input
        type="text"
        placeholder="Cliente"
        class="border rounded-lg px-2 py-1 text-sm w-full h-9"
        [(ngModel)]="filtros.cliente"
      />

      <!-- Fecha Inicio -->
      <input
        type="date"
        class="border rounded-lg px-2 py-1 text-sm w-full h-9"
        [(ngModel)]="filtros.fechaInicio"
      />

      <!-- Fecha Fin -->
      <input
        type="date"
        class="border rounded-lg px-2 py-1 text-sm w-full h-9"
        [(ngModel)]="filtros.fechaFin"
      />

      <!-- Botones -->
      <div class="grid grid-cols-2 gap-1 col-span-2 lg:col-span-1">
        <button
          class="bg-blue-600 text-white rounded-lg py-1 text-sm hover:bg-blue-700 h-9"
          (click)="buscar()">
          Buscar
        </button>

        <button
          class="bg-gray-300 rounded-lg py-1 text-sm hover:bg-gray-400 h-9"
          (click)="limpiar()">
          Limpiar
        </button>
      </div>

    </div>
  `
})
export class FiltrosVentasComponent {

  filtros: FiltrosVenta = {
    idVenta: null,
    cliente: '',
    fechaInicio: '',
    fechaFin: ''
  };

  @Output() filtrar = new EventEmitter<FiltrosVenta>();

  buscar() {
    this.filtrar.emit(this.filtros);
  }

  limpiar() {
    this.filtros = {
      idVenta: null,
      cliente: '',
      fechaInicio: '',
      fechaFin: ''
    };
    this.filtrar.emit(this.filtros);
  }
}
