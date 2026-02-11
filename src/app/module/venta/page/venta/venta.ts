import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { VentaService } from '../../service/venta-service';
import { Venta } from '../../model/venta.model';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReusableTable
  ],
  templateUrl: './venta.html',
  styleUrls: ['./venta.scss']
})
export class VentaComponent implements OnInit {

  ventas: Venta[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;

  empresaId!: number;
  pageSize = 10;

  columns: TableColumn[] = [
    { field: 'idventa', header: 'ID' },
    { field: 'fecha', header: 'Fecha' },
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'telefonoCliente', header: 'Teléfono' },
    { field: 'total', header: 'Total' },
    { field: 'nombreUsuario', header: 'Vendedor' }
  ];

  constructor(
    private ventaService: VentaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.empresaId = Number(this.authService.getEmpresaId());
    console.log('Empresa ID:', this.empresaId);
    this.getVentas();
  }

  getVentas(page: number = 0): void {
    this.loading = true;

    this.ventaService.getVentasByEmpresa(this.empresaId, page, this.pageSize)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          console.log('Respuesta ventas:', res);

          this.ventas = res.data.ventas;
          this.currentPage = res.data.currentPage;
          this.totalPages = res.data.totalPages;
        },
        error: err => console.error(err)
      });
  }
}
