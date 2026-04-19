export interface DevolucionRequest {
  ventaId: number;
  productoId: number;
  cantidad: number;
  motivo: string;
}

export interface DevolucionResponse {
  iddevolucion: number;
  ventaId: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export interface DevolucionApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    devoluciones: DevolucionResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  timestamp: string;
}
