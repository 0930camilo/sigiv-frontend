import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro.html',
  styleUrls: ['./filtro.scss']
})
export class FiltrosVentasComponent {

  filtroCodigo: string = '';

  @Output() filtrarId = new EventEmitter<number | null>();

  buscarPorCodigo() {
    const id = this.filtroCodigo.trim();

    if (!id) {
      this.filtrarId.emit(null);
      return;
    }

    const numero = Number(id);

    if (isNaN(numero)) {
      this.filtrarId.emit(null);
      return;
    }

    this.filtrarId.emit(numero);
  }
}
