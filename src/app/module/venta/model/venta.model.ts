export interface VentaDetalle {
  descripcionProducto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Venta {
  idventa: number;
  fecha: string;
  nombreCliente: string;
  telefonoCliente: string;
  total: number;
  efectivo: number;
  cambio: number;
  nombreUsuario: string;
  detalles: VentaDetalle[];
}

export interface VentasResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    ventas: Venta[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
  timestamp: string;
}
