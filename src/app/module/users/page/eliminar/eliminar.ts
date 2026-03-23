import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UserService } from '../../service/user-service';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar.html',
  styleUrls: ['./eliminar.scss']
})
export class EliminarUsuarioComponent {

  @Input() usuario: any;
  @Output() eliminado = new EventEmitter<number>();
  @Output() cerrar = new EventEmitter<void>();

  loading = false;

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  confirmarEliminar() {
    this.loading = true;

    this.userService.deleteUser(this.usuario.idUsuario)
      .subscribe({
        next: () => {
          this.loading = false;
          this.cdr.markForCheck();

          Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            text: 'El usuario fue eliminado correctamente.',
            timer: 1500,
            showConfirmButton: false
          });

          this.eliminado.emit(this.usuario.idUsuario);
          this.cerrar.emit();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el usuario.'
          });
        }
      });
  }
}
