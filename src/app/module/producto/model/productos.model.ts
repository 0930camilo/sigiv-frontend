export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioCompra: number;
  precio: number;
  fecha: string;
  estado: 'Activo' | 'Inactivo';

  proveedorId: number | null;
  proveedorNombre?: string;

  categoriaId: number;
  categoriaNombre?: string;
}

export interface ProductosResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    totalPages: number;
    currentPage: number;
    totalElements: number;
    productos: Producto[];
  };
  timestamp: string;
}

export interface ProductoCreateRequest {
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioCompra: number;
  precio: number;
  estado: 'Activo' | 'Inactivo';
  proveedorId?: number;
  categoriaId: number;
}

export interface ProductoImportFilaError {
  fila: number;
  error: string;
}

export interface ProductoImportResultDto {
  totalFilas: number;
  exitosos: number;
  fallidos: number;
  errores: ProductoImportFilaError[];
}
