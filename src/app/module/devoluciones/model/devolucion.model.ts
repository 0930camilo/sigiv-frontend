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
