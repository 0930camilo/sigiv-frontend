import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProductoService } from '../../service/producto-service';

@Component({
  selector: 'app-delete-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar.html',
  styleUrls: ['./eliminar.scss']
})
export class EliminarProductoComponent {

  @Input() producto : any;
  @Output() eliminado = new EventEmitter<number>();
  @Output() cerrar = new EventEmitter<void>();

  loading = false;

  constructor(private productoService: ProductoService, private cdr: ChangeDetectorRef) {}

  confirmarEliminar() {
    this.loading = true;

    this.productoService.deleteProducto(this.producto.idProducto)
      .subscribe({
        next: () => {
          this.loading = false;
          this.eliminado.emit(this.producto.idProducto);
          this.cerrar.emit();
          this.cdr.markForCheck();

          Swal.fire({
            icon: 'success',
            title: 'Producto eliminado',
            text: 'El producto fue eliminado correctamente.',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el producto. Intente nuevamente más tarde.'
          });
        }
      });
  }
}
