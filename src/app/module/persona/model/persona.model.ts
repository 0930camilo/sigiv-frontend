export interface Persona {
  idpersona: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  estado: 'Activo' | 'Inactivo';
  empresaId: number;
}

export interface PersonaRequest {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  estado: 'Activo' | 'Inactivo';
  empresaId: number;
}

export interface PersonaApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    personas: Persona[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  timestamp: string;
}

export interface PersonaSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Persona;
  timestamp: string;
}
