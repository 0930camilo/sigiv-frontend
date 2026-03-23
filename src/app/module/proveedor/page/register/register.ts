import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProveedorService } from '../../service/proveedor-service';
import { ProveedorCreateRequest } from '../../model/proveedor.model';

@Component({
  selector: 'app-register-proveedor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterProveedor {
  @Input() empresaId!: number | null;
  @Output() proveedorCreado = new EventEmitter<any>();

  mostrarModal = false;
  creandoProveedor = false;
  formProveedor!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.formProveedor = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      direccion: ['', Validators.required],
      estado: ['Activo', Validators.required],
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.formProveedor.reset({ estado: 'Activo' });
  }

  crearProveedor(): void {
    if (!this.empresaId || this.formProveedor.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos requeridos.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const payload: ProveedorCreateRequest = {
      ...this.formProveedor.value,
      empresaId: this.empresaId
    };

    this.creandoProveedor = true;

    this.proveedorService.createProveedor(payload).subscribe({
      next: (res) => {
        this.creandoProveedor = false;
        this.cerrarModal();
        this.proveedorCreado.emit(res.data || null);
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          text: 'El proveedor se registró correctamente.',
          confirmButtonColor: '#2563eb',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al crear proveedor:', err);
        this.creandoProveedor = false;
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el proveedor. Intenta nuevamente.',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}
