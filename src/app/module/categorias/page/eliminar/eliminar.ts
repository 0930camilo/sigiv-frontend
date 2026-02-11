import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CategoriaService } from '../../service/categoria-service';

@Component({
  selector: 'app-eliminar-categoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar.html',
  styleUrls: ['./eliminar.scss']
})
export class EliminarCategoriaComponent {

  @Input() categoria: any;
  @Output() eliminado = new EventEmitter<number>();
  @Output() cerrar = new EventEmitter<void>();

  loading = false;

  constructor(private categoriaService: CategoriaService) {}

  confirmarEliminar() {
    this.loading = true;

    this.categoriaService.deleteCategoria(this.categoria.idCategoria)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Categoría eliminada',
            text: 'La categoría fue eliminada correctamente.',
            timer: 1500,
            showConfirmButton: false
          });

          this.eliminado.emit(this.categoria.idCategoria  );
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la categoría.'
          });
        },
        complete: () => {
          this.loading = false;
          this.cerrar.emit();
        }
      });
  }
}
