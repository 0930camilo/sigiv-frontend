export interface Usuario {
  idUsuario: number;
  nombres: string;
  direccion: string;
  telefono: number;
  estado: string;
  empresaId: number;
}

export interface UsuariosResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    totalPages: number;
    usuarios: Usuario[];
    currentPage: number;
    totalElements: number;
  };
  timestamp: string;
}

export interface UsuarioCreateRequest {
  nombres: string;
  clave: string;
  telefono: number;
  direccion: string;
  estado: string;
  empresaId: number;
}

export interface UsuarioCreateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    idUsuario: number;
    nombres: string;
    direccion: string;
    telefono: number;
    estado: string;
    empresaId: number;
  };
  timestamp: string;
}
