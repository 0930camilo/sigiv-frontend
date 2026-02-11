export interface Categoria {
  idCategoria: number;
  nombre: string;
  estado: 'Activo' | 'Inactivo';
  empresaId: number;
}

export interface CategoriasResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    totalPages: number;
    categorias: Categoria[];
    currentPage: number;
    totalElements: number;
  };
  timestamp: string;
}

export interface CategoriaCreateRequest {
  nombre: string;
  estado: 'Activo' | 'Inactivo';
  empresaId: number;
}

export interface CategoriaCreateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Categoria;
  timestamp: string;
}
