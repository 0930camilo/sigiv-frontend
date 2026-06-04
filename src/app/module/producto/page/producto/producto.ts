import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableColumn } from '../../../../shared/interface/TableColumn';
import { AuthService } from '../../../auth/service/auth-service';
import { ReusableTable } from '../../../../components/reusable-table/reusable-table';
import { RegisterProducto } from '../register/register';
import { ProductoService } from '../../service/producto-service';
import { EditarProductoComponent } from '../editar/editar';
import { EliminarProductoComponent } from '../eliminar/eliminar';
import { FiltrosProductoComponent } from '../filtro/filtro';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    RegisterProducto,
    ReusableTable,
    EditarProductoComponent,
    EliminarProductoComponent,
    FiltrosProductoComponent
  ],
  templateUrl: './producto.html',
  styleUrls: ['./producto.scss']
})
export class Producto implements OnInit {

  productos: any[] = [];
  loading = false;

  empresaId: number | null = null;
  productoSeleccionado: any = null;
  productoAEliminar: any = null;

  currentPage = 0;
  totalPages = 0;
  pageSize = 10;
  importando = false;
  downloadingPlantilla = false;

  filtros: any = {
    nombre: '',
    estado: '',
    categoria: null,
    proveedor: null
  };

  columns: TableColumn[] = [
    { field: 'idProducto', header: 'ID', type: 'text' },
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'descripcion', header: 'Descripción', type: 'text' },
    { field: 'cantidad', header: 'Cantidad', type: 'number' },
    { field: 'precioCompra', header: 'Precio Compra', type: 'currency' },
    { field: 'precio', header: 'Precio Venta', type: 'currency' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'categoriaNombre', header: 'Categoría', type: 'text' },
    { field: 'proveedorNombre', header: 'Proveedor', type: 'text' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();

    if (this.empresaId) {
      this.getProductos();
    }
  }

  // ===============================
  // LISTAR PRODUCTOS
  // ===============================
  getProductos(page: number = 0): void {
    if (!this.empresaId) return;

    this.loading = true;

    console.log("FILTROS ENVIADOS:", this.filtros);

    this.productoService
      .getProductosByEmpresa(
        this.empresaId,
        page,
        this.pageSize,
        this.filtros
      )
      .subscribe({
        next: (data) => {
          this.productos = data.productos;
          this.currentPage = data.currentPage;
          this.totalPages = data.totalPages;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Error cargando productos:", err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  // ===============================
  // PAGINACIÓN
  // ===============================
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.getProductos(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.getProductos(this.currentPage - 1);
    }
  }

  // ===============================
  // CRUD UI
  // ===============================
  onProductoCreado(nuevoProducto: any): void {
    this.getProductos(0);
  }

  onProductoActualizado(productoEditado: any): void {
    this.getProductos(this.currentPage);
    this.productoSeleccionado = null;
  }

  onProductoEliminado(idProducto: number): void {
    this.getProductos(this.currentPage);
    this.productoAEliminar = null;
  }

  onAction(event: { action: string; row: any }) {
    if (event.action === 'edit') {
      this.productoSeleccionado = { ...event.row };
    } else if (event.action === 'delete') {
      this.productoAEliminar = { ...event.row };
    } else if (event.action === 'barcode') {
      const codigoBarra = event.row?.codigoBarra;
      if (!codigoBarra) {
        Swal.fire('Sin codigo', 'Este producto no tiene codigo de barra.', 'info');
        return;
      }

      Swal.fire({
        title: 'Cargando codigo de barra...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.productoService.getCodigoBarraImagen(codigoBarra).subscribe({
        next: (data) => {
          const imagenBase64 = data?.imagenBase64;
          if (!imagenBase64) {
            Swal.fire('Sin imagen', 'No se encontro la imagen del codigo de barra.', 'info');
            return;
          }

          const imageUrl = `data:image/png;base64,${imagenBase64}`;
          Swal.fire({
            title: `Codigo: ${codigoBarra}`,
            imageUrl,
            imageAlt: `Codigo de barra ${codigoBarra}`,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#2563eb'
          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cargar la imagen del codigo de barra.', 'error');
        }
      });
    }
  }

  // ===============================
  // FILTROS 🔥
  // ===============================
  filtrarPorNombre(nombre: string) {
    this.filtros.nombre = nombre;
    this.getProductos(0);
  }

  filtrarPorEstado(estado: string) {
    this.filtros.estado = estado;
    this.getProductos(0);
  }

  filtrarPorCategoria(nombre: string | null) {
    this.filtros.categoria = nombre || '';
    this.getProductos(0);
  }

  filtrarPorProveedor(nombre: string | null) {
    this.filtros.proveedor = nombre || '';
    this.getProductos(0);
  }

  abrirSelectorArchivo(input: HTMLInputElement): void {
    if (this.importando) return;
    input.value = '';
    input.click();
  }

  downloadPlantilla(): void {
    if (!this.empresaId) return;

    this.downloadingPlantilla = true;
    this.productoService
      .getPlantillaProductosPorEmpresa(this.empresaId)
      .pipe(finalize(() => {
        this.downloadingPlantilla = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res: any) => {
          const archivoBase64 = this.stripBase64Prefix(res?.data?.archivo || '');
          if (!archivoBase64) {
            console.error('La plantilla recibida esta vacia.');
            return;
          }

          const blob = this.base64ToBlob(
            archivoBase64,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          const fileName = res?.data?.nombreArchivo
            || `plantilla-productos-empresa-${this.empresaId}.xlsx`;
          this.triggerDownload(blob, fileName);
        },
        error: (err) => {
          console.error('Error al descargar plantilla:', err);
        }
      });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const extension = archivo.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      Swal.fire('Archivo invalido', 'Solo se permiten archivos .xlsx o .xls', 'warning');
      return;
    }

    this.importando = true;
    this.productoService.importarProductosExcel(archivo).subscribe({
      next: (res) => {
        this.importando = false;
        const errores = res.errores || [];
        const detalleErrores = errores
          .slice(0, 5)
          .map((e) => `Fila ${e.fila}: ${e.error}`)
          .join('<br/>');

        Swal.fire({
          icon: errores.length > 0 ? 'warning' : 'success',
          title: 'Importacion finalizada',
          html: `Total filas: <b>${res.totalFilas}</b><br/>` +
            `Exitosos: <b>${res.exitosos}</b><br/>` +
            `Fallidos: <b>${res.fallidos}</b>` +
            (detalleErrores ? `<br/><br/>${detalleErrores}` : ''),
          confirmButtonColor: '#2563eb'
        });

        this.getProductos(0);
      },
      error: () => {
        this.importando = false;
        Swal.fire('Error', 'No se pudo importar el archivo.', 'error');
      }
    });
  }

  private stripBase64Prefix(base64: string): string {
    if (!base64) return '';
    const commaIndex = base64.indexOf(',');
    if (base64.includes('base64,') && commaIndex !== -1) {
      return base64.slice(commaIndex + 1).replace(/\s+/g, '').trim();
    }
    return base64.replace(/\s+/g, '').trim();
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: contentType });
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  }
}
