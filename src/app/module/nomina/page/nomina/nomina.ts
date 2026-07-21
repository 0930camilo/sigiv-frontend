import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { TableColumn } from '../../../../shared/interface/TableColumn';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { NominaService } from '../../service/nomina-service';
import { Nomina, NominaRequest, PersonaNomina, PersonaNominaRequest } from '../../model/nomina.model';
import { AuthService } from '../../../auth/service/auth-service';
import { PersonaService } from '../../../persona/service/persona-service';
import { Persona } from '../../../persona/model/persona.model';

@Component({
  selector: 'app-nomina',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReusableTable],
  templateUrl: './nomina.html',
  styleUrls: ['./nomina.scss']
})
export class NominaComponent implements OnInit {

  nominas: Nomina[] = [];
  loading = false;
  empresaId: number | null = null;
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  // Modal crear/editar nómina
  mostrarModal = false;
  editando = false;
  nominaEditandoId: number | null = null;

  form: NominaRequest = this.formVacio();

  columns: TableColumn[] = [];
  isMobile = false;

  columnsDesktop: TableColumn[] = [
    { field: 'idNomina', header: 'ID' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'fechaInicio', header: 'Fecha Inicio', type: 'date' },
    { field: 'fechaFin', header: 'Fecha Fin', type: 'date' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'totalPago', header: 'Total Pago', type: 'currency' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  columnsMobile: TableColumn[] = [
    { field: 'descripcion', header: 'Descripción' },
    { field: 'fechaInicio', header: 'Fecha Inicio', type: 'date' },
    { field: 'fechaFin', header: 'Fecha Fin', type: 'date' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'totalPago', header: 'Total Pago', type: 'currency' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  // Detalle PersonaNomina
  mostrarDetalle = false;
  nominaSeleccionada: Nomina | null = null;
  personasNomina: PersonaNomina[] = [];
  loadingDetalle = false;

  // Modal asignar persona
  mostrarModalAsignar = false;
  personasDisponibles: Persona[] = [];
  personaNombreById: Record<number, string> = {};
  asignarForm: PersonaNominaRequest = { idNomina: 0, idPersona: 0, diasTrabajados: 0, valorDia: 0 };

  constructor(
    private nominaService: NominaService,
    private personaService: PersonaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    this.actualizarColumnas();
    this.cargarPersonasEmpresa();
    this.cargarNominas();
  }

  @HostListener('window:resize')
  onResize() {
    this.actualizarColumnas();
  }

  actualizarColumnas() {
    this.isMobile = window.innerWidth < 768;
    this.columns = this.isMobile ? this.columnsMobile : this.columnsDesktop;
    this.cdr.detectChanges();
  }

  cargarNominas(page: number = 0): void {
    if (!this.empresaId) return;
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;
    this.loading = true;

    this.nominaService.listarPorEmpresa(this.empresaId, page, this.pageSize).subscribe({
      next: (res) => {
        this.nominas = Array.isArray(res.data?.nominas) ? res.data.nominas : [];
        this.currentPage = res.data?.currentPage ?? 0;
        this.totalPages = res.data?.totalPages ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando nóminas:', err);
        this.nominas = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- CRUD Nómina ---

  abrirModalCrear(): void {
    this.editando = false;
    this.nominaEditandoId = null;
    this.form = this.formVacio();
    this.mostrarModal = true;
  }

  abrirModalEditar(nomina: Nomina): void {
    this.editando = true;
    this.nominaEditandoId = nomina.idNomina;
    this.form = {
      descripcion: nomina.descripcion,
      fechaInicio: nomina.fechaInicio,
      fechaFin: nomina.fechaFin,
      estado: nomina.estado,
      empresaId: this.empresaId!
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.form = this.formVacio();
  }

  guardar(): void {
    if (!this.form.descripcion || !this.empresaId) {
      Swal.fire('Atención', 'La descripción es obligatoria', 'warning');
      return;
    }

    this.form.empresaId = this.empresaId;

    if (this.editando && this.nominaEditandoId) {
      this.nominaService.actualizarNomina(this.nominaEditandoId, this.form).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Nómina actualizada correctamente', 'success');
          this.cerrarModal();
          this.cargarNominas();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar la nómina', 'error')
      });
    } else {
      this.nominaService.crearNomina(this.form).subscribe({
        next: () => {
          Swal.fire('Creado', 'Nómina creada correctamente', 'success');
          this.cerrarModal();
          this.cargarNominas();
        },
        error: () => Swal.fire('Error', 'No se pudo crear la nómina', 'error')
      });
    }
  }

  eliminar(nomina: Nomina): void {
    Swal.fire({
      title: '¿Eliminar nómina?',
      text: `Se eliminará "${nomina.descripcion}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.nominaService.eliminarNomina(nomina.idNomina).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Nómina eliminada', 'success');
            this.cargarNominas();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  onAction(event: { action: string; row: Nomina }): void {
    if (event.action === 'edit') {
      this.abrirModalEditar(event.row);
    } else if (event.action === 'delete') {
      this.eliminar(event.row);
    }
  }

  // --- Detalle PersonaNomina ---

  verDetalle(nomina: Nomina): void {
    this.nominaSeleccionada = nomina;
    this.mostrarDetalle = true;
    this.cargarPersonasNomina(nomina.idNomina);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.nominaSeleccionada = null;
    this.personasNomina = [];
  }

  cargarPersonasNomina(nominaId: number): void {
    this.loadingDetalle = true;
    this.nominaService.listarPersonaNomina(nominaId).subscribe({
      next: (res) => {
        this.personasNomina = Array.isArray(res.data) ? res.data : [];
        this.loadingDetalle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.personasNomina = [];
        this.loadingDetalle = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarPersonasEmpresa(): void {
    if (!this.empresaId) return;
    this.personaService.listarPorEmpresa(this.empresaId, 0, 200).subscribe({
      next: (res) => {
        this.personasDisponibles = Array.isArray(res.data?.personas) ? res.data.personas : [];
        this.personaNombreById = this.personasDisponibles.reduce((acc, persona) => {
          acc[persona.idpersona] = persona.nombre;
          return acc;
        }, {} as Record<number, string>);
        this.cdr.detectChanges();
      },
      error: () => {
        this.personasDisponibles = [];
        this.personaNombreById = {};
        this.cdr.detectChanges();
      }
    });
  }

  // --- Asignar persona a nómina ---

  abrirModalAsignar(): void {
    if (!this.nominaSeleccionada || !this.empresaId) return;
    this.asignarForm = { idNomina: this.nominaSeleccionada.idNomina, idPersona: 0, diasTrabajados: 0, valorDia: 0 };
    if (this.personasDisponibles.length === 0) {
      this.cargarPersonasEmpresa();
    }
    this.mostrarModalAsignar = true;
  }

  cerrarModalAsignar(): void {
    this.mostrarModalAsignar = false;
  }

  asignarPersona(): void {
    if (!this.asignarForm.idPersona || !this.asignarForm.diasTrabajados || !this.asignarForm.valorDia) {
      Swal.fire('Atención', 'Todos los campos son obligatorios', 'warning');
      return;
    }

    this.nominaService.crearPersonaNomina(this.asignarForm).subscribe({
      next: () => {
        Swal.fire('Asignado', 'Persona asignada a la nómina correctamente', 'success');
        this.cerrarModalAsignar();
        this.cargarPersonasNomina(this.nominaSeleccionada!.idNomina);
        this.cargarNominas();
      },
      error: () => Swal.fire('Error', 'No se pudo asignar', 'error')
    });
  }

  eliminarPersonaNomina(pn: PersonaNomina): void {
    const personaNombre = this.personaNombreById[pn.idPersona];
    const personaLabel = personaNombre ? personaNombre : `ID ${pn.idPersona}`;
    Swal.fire({
      title: '¿Eliminar asignación?',
      text: `Se eliminará la persona ${personaLabel} de esta nómina`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.nominaService.eliminarPersonaNomina(pn.idPersona).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Asignación eliminada', 'success');
            this.cargarPersonasNomina(this.nominaSeleccionada!.idNomina);
            this.cargarNominas();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  private formVacio(): NominaRequest {
    return {
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'Activo',
      empresaId: this.empresaId || 0
    };
  }
}
