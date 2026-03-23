import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableColumn } from '../../shared/interface/TableColumn';

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reusable-table.html',
  styleUrl: './reusable-table.scss'
})
export class ReusableTable {

  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading = false;

  @Input() currentPage = 0;
  @Input() totalPages = 0;

  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  // para Editar / Eliminar
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
}
