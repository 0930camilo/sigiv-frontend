import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { PersonaService } from '../../service/persona-service';
import { Persona, PersonaRequest } from '../../model/persona.model';
import { AuthService } from '../../../auth/service/auth-service';

@Component({
  selector: 'app-persona',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReusableTable],
  templateUrl: './persona.html',
  styleUrls: ['./persona.scss']
})
export class PersonaComponent implements OnInit {

  personas: Persona[] = [];
  loading = false;
  empresaId: number | null = null;
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  // Filtros
  filtroEstado: string = '';
  filtroDocumento: string = '';
  filtroNombre: string = '';

  mostrarModal = false;
  editando = false;
  personaEditandoId: number | null = null;

  form: PersonaRequest = this.formVacio();

  columns: TableColumn[] = [
    { field: 'documento', header: 'Documento' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'correo', header: 'Correo' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'direccion', header: 'Dirección' },
    { field: 'fechaNacimiento', header: 'F. Nacimiento', type: 'date' },
    { field: 'fechaIngreso', header: 'F. Ingreso', type: 'date' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  constructor(
    private personaService: PersonaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    this.cargarPersonas();
  }

  cargarPersonas(page: number = 0): void {
    if (!this.empresaId) return;
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;
    this.loading = true;

    const filtros: { estado?: string; documento?: string; nombre?: string } = {};
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.filtroDocumento.trim()) filtros.documento = this.filtroDocumento.trim();
    if (this.filtroNombre.trim()) filtros.nombre = this.filtroNombre.trim();

    this.personaService.listarPorEmpresa(this.empresaId, page, this.pageSize, filtros)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.personas = Array.isArray(res.data?.personas) ? res.data.personas : [];
          this.currentPage = res.data?.currentPage ?? 0;
          this.totalPages = res.data?.totalPages ?? 0;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error cargando personas:', err);
          this.personas = [];
        }
      });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.personaEditandoId = null;
    this.form = this.formVacio();
    this.mostrarModal = true;
  }

  filtrar(): void {
    this.currentPage = 0;
    this.cargarPersonas(0);
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroDocumento = '';
    this.currentPage = 0;
    this.cargarPersonas(0);
  }

  abrirModalEditar(persona: Persona): void {
    this.editando = true;
    this.personaEditandoId = persona.idpersona;
    this.form = {
      nombre: persona.nombre,
      documento: persona.documento,
      correo: persona.correo,
      telefono: persona.telefono,
      direccion: persona.direccion,
      fechaNacimiento: persona.fechaNacimiento,
      fechaIngreso: persona.fechaIngreso,
      estado: persona.estado,
      empresaId: this.empresaId!
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.form = this.formVacio();
  }

  guardar(): void {
    if (!this.form.nombre || !this.empresaId) {
      Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
      return;
    }

    this.form.empresaId = this.empresaId;

    if (this.editando && this.personaEditandoId) {
      this.personaService.actualizarPersona(this.personaEditandoId, this.form).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Persona actualizada correctamente', 'success');
          this.cerrarModal();
          this.cargarPersonas();
          this.cdr.markForCheck();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar la persona', 'error')
      });
    } else {
      this.personaService.crearPersona(this.form).subscribe({
        next: () => {
          Swal.fire('Creado', 'Persona creada correctamente', 'success');
          this.cerrarModal();
          this.cargarPersonas();
          this.cdr.markForCheck();
        },
        error: () => Swal.fire('Error', 'No se pudo crear la persona', 'error')
      });
    }
  }

  eliminar(persona: Persona): void {
    Swal.fire({
      title: '¿Eliminar persona?',
      text: `Se eliminará "${persona.nombre}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.personaService.eliminarPersona(persona.idpersona).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Persona eliminada', 'success');
            this.cargarPersonas();
            this.cdr.markForCheck();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  cambiarEstado(persona: Persona): void {
    this.personaService.cambiarEstado(persona.idpersona).subscribe({
      next: () => {
        this.cargarPersonas();
        this.cdr.markForCheck();
      },
      error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    });
  }

  onAction(event: { action: string; row: Persona }): void {
    if (event.action === 'edit') {
      this.abrirModalEditar(event.row);
    } else if (event.action === 'delete') {
      this.eliminar(event.row);
    }
  }

  private formVacio(): PersonaRequest {
    return {
      documento: '',
      nombre: '',
      correo: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      fechaIngreso: '',
      estado: 'Activo',
      empresaId: this.empresaId || 0
    };
  }
}
