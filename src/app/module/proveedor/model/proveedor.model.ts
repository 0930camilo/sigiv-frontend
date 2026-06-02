export interface Proveedor {
  idProveedor: number;
  documento: string;
  nombre: string;
  telefono: number;
  direccion: string;
  estado: string;
  empresaId: number;
}


export interface ProveedoresResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    totalPages: number;
    proveedores: Proveedor[];
    currentPage: number;
    totalElements: number;
  };
  timestamp: string;
}

export interface ProveedorCreateRequest {
  documento: string;
  nombre: string;
  telefono: number;
  direccion: string;
  estado: string;
  empresaId: number;
}

export interface ProveedorUpdateRequest {
  documento?: string;
  nombre?: string;
  telefono?: number;
  direccion?: string;
  estado?: string;
  empresaId?: number;
}

export interface ProveedorCreateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    idProveedor: number;
    documento: string;
    nombre: string;
    telefono: number;
    direccion: string;
    estado: string;
    empresaId: number;
  };
  timestamp: string;
}
