import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro.html',
  styleUrls: ['./filtro.scss']
})
export class FiltrosCategoriaComponent {

  filtroNombre: string = '';
  filtroEstado: string = '';

  @Output() filtrarNombre = new EventEmitter<string>();
  @Output() filtrarEstado = new EventEmitter<string>();

  buscarPorNombre() {
    this.filtrarNombre.emit(this.filtroNombre);
  }

  filtrarPorEstado() {
    this.filtrarEstado.emit(this.filtroEstado);
  }
}
