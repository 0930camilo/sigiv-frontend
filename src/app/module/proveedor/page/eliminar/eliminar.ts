import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProveedorService } from '../../service/proveedor-service';

@Component({
  selector: 'app-delete-proveedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar.html',
  styleUrls: ['./eliminar.scss']
})
export class EliminarProveedorComponent {

  @Input() proveedor: any;
  @Output() eliminado = new EventEmitter<number>();
  @Output() cerrar = new EventEmitter<void>();

  loading = false;

  constructor(private proveedorService: ProveedorService) {}

  confirmarEliminar() {
    this.loading = true;

    this.proveedorService.deleteProveedor(this.proveedor.idProveedor)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Proveedor eliminado',
            text: 'El proveedor fue eliminado correctamente.',
            timer: 1500,
            showConfirmButton: false
          });

          this.eliminado.emit(this.proveedor.idProveedor);
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el proveedor.'
          });
        },
        complete: () => {
          this.loading = false;
          this.cerrar.emit();
        }
      });
  }
}
