export interface VentaDetalle {
  descripcionProducto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  unidadMedida?: string;
}

export interface Venta {
  idventa: number;
  fecha: string;
  nombreCliente: string;
  telefonoCliente: string;
  correoCliente?: string;
  documentoCliente?: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  efectivo: number;
  cambio: number;
  tipoPago?: 'CONTADO' | 'CREDITO' | string;
  estadoPago?: 'PAGADA' | 'PENDIENTE' | string;
  totalAbonado?: number;
  saldoPendiente?: number;
  abonos?: Abono[];
  nombreUsuario: string;
  empresaNombre?: string;
  detalles: VentaDetalle[];
}

export interface Abono {
  idAbono?: number;
  ventaId?: number;
  valor: number;
  fecha: string;
  metodoPago: string;
  observacion?: string;
  usuarioId?: number;
  nombreUsuario?: string;
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
  correoCliente?: string;
  documentoCliente?: string;
  tipoPago?: 'CONTADO' | 'CREDITO';
  efectivo: number;
  abonoInicial?: number;
  metodoPagoAbonoInicial?: string;
  descuentoTotal: number;
  detalles: DetalleVentaRequest[];
  enviarFactura?: boolean;
  canalEnvioFactura?: 'ninguno' | 'correo' | 'whatsapp' | 'correo-whatsapp';
  formatoFactura?: 'POS';
  registrarCliente?: boolean;
}

export interface AbonoRequest {
  usuarioId: number;
  valor: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'OTRO' | string;
  observacion?: string;
}

// --- Carrito (frontend only) ---

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  disponible: number;
  unidadMedida?: string;
}
