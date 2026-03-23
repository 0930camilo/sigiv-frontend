import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro.html',
  styleUrls: ['./filtro.scss']
})
export class FiltrosUsuarioComponent {

  filtroNombre: string = '';
  filtroEstado: string = '';

  @Output() filtrarNombre = new EventEmitter<string>();
  @Output() filtrarEstado = new EventEmitter<string>();

  buscarPorNombre(): void {
    this.filtrarNombre.emit(this.filtroNombre);
  }

  filtrarPorEstado(): void {
    this.filtrarEstado.emit(this.filtroEstado);
  }
}
