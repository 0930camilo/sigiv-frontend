export interface Proveedor {
  idProveedor: number;
  nombre: string;
  telefono: number;
  direccion: string;
  estado: string;
  empresaId: number; }


  export interface ProveedoresResponse {
     success: boolean;
     statusCode: number;
     message: string; data: {
      totalPages: number;
      proveedores: Proveedor[];
      currentPage: number;
      totalElements: number; };
       timestamp: string; }

       export interface ProveedorCreateRequest {
        nombre: string;
        telefono: number;
        direccion: string;
        estado: string;
        empresaId: number; }



        export interface ProveedorCreateResponse {
           success: boolean;
           statusCode: number;
           message: string; data: {
            idProveedor: number;
            nombre: string;
            telefono: number;
            direccion: string;
            estado: string;
            empresaId: number;
          };
          timestamp: string; }
