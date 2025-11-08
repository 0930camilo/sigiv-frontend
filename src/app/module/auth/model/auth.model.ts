 export interface LoginRequest {
  usuario: string;
  clave: string;
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    token: string;
    usuario: string;
    rol: string;
  };
  timestamp: string;
}

export interface TokenPayload {
  estado: string;
  nombre?: string;
  nombre_empresa?: string;
  nit?: string;
  empresa_id?: number;
  id: number;
  rol: string;
  sub: string;
  iat: number;
  exp: number;
}