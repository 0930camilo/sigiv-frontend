export interface Nomina {
  idNomina: number;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'Activo' | 'Inactivo';
  totalPago: number;
  empresaNombre: string;
}

export interface NominaRequest {
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'Activo' | 'Inactivo';
  empresaId: number;
}

export interface NominaApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    nominas: Nomina[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  timestamp: string;
}

export interface NominaSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Nomina;
  timestamp: string;
}

export interface PersonaNomina {
  idNomina: number;
  idPersona: number;
  diasTrabajados: number;
  valorDia: number;
  salario: number;
}

export interface PersonaNominaRequest {
  idNomina: number;
  idPersona: number;
  diasTrabajados: number;
  valorDia: number;
}

export interface PersonaNominaApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PersonaNomina[];
  timestamp: string;
}

export interface PersonaNominaSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PersonaNomina;
  timestamp: string;
}
