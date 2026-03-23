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
  empresaNombre?: string;
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
  timestamp?: string;
}

// --- Request DTOs ---

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface VentaRequest {
  usuarioId: number;
  nombreCliente: string;
  telefonoCliente: string;
  efectivo: number;
  detalles: DetalleVentaRequest[];
}

// --- Carrito (frontend only) ---

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  disponible: number;
}
