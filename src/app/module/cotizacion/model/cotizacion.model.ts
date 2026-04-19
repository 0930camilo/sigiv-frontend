export interface DetalleCotizacionResponse {
  descripcionProducto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Cotizacion {
  idcotizacion: number;
  fecha: string;
  nombreCliente: string;
  telefonoCliente: string;
  total: number;
  nombreUsuario: string;
  detalles: DetalleCotizacionResponse[];
}

export interface CotizacionesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    cotizaciones: Cotizacion[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
  timestamp?: string;
}

// --- Request DTOs ---

export interface DetalleCotizacionRequest {
  productoId: number;
  cantidad: number;
}

export interface CotizacionRequest {
  usuarioId: number;
  nombreCliente: string;
  telefonoCliente: string;
  total: number;
  detalles: DetalleCotizacionRequest[];
}

// --- Carrito (frontend only) ---

export interface ItemCarritoCotizacion {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  disponible: number;
}
