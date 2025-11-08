import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableColumn } from '../../shared/interface/TableColumn';

@Component({
  selector: 'app-reusable-table',
  imports: [CommonModule],
  templateUrl: './reusable-table.html',
  styleUrl: './reusable-table.scss'
})
export class ReusableTable {

  /** Datos a mostrar en la tabla */
  @Input() data: any[] = [];

  /** Definición de columnas */
  @Input() columns: TableColumn[] = [];

  /** Estado de carga */
  @Input() loading = false;

  /** Configuración de paginación */
  @Input() currentPage = 0;
  @Input() totalPages = 0;

  /** Eventos */
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
}


