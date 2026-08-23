import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';
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
export class Producto implements OnInit, OnDestroy {

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
    codigoBarra: '',
    estado: '',
    categoria: null,
    proveedor: null
  };

  columns: TableColumn[] = [];

  columnsDesktop: TableColumn[] = [
    { field: 'idProducto', header: 'ID', type: 'text' },
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'descripcion', header: 'Descripción', type: 'text' },
    { field: 'cantidad', header: 'Cant.', type: 'text' },
    { field: 'unidadMedida', header: 'U.M.', type: 'text' },
    { field: 'precioCompra', header: 'Precio Compra', type: 'currency' },
    { field: 'precio', header: 'Precio Venta', type: 'currency' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'categoriaNombre', header: 'Categoría', type: 'text' },
    { field: 'proveedorNombre', header: 'Proveedor', type: 'text' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  columnsMobile: TableColumn[] = [
    { field: 'nombre', header: 'Nombre', type: 'text' },
    { field: 'cantidad', header: 'Cant.', type: 'text' },
    { field: 'unidadMedida', header: 'U.M.', type: 'text' },
    { field: 'precio', header: 'Venta', type: 'currency' },
    { field: 'estado', header: 'Estado', type: 'status' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.actualizarColumnas();

    this.empresaId = this.authService.getEmpresaId();

    if (this.empresaId) {
      this.getProductos();
    }
  }

  @ViewChild('scannerVideo')
  scannerVideo?: ElementRef<HTMLVideoElement>;

  @ViewChild(FiltrosProductoComponent)
  filtrosComponent?: FiltrosProductoComponent;

  scannerActivo = false;
  scannerError = '';
  private scannerControls: any = null;

  async iniciarEscaner(): Promise<void> {
    if (this.scannerActivo) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.scannerError = 'Este navegador no permite acceder a la cámara para escanear.';
      this.cdr.markForCheck();
      return;
    }

    try {
      const zxing = await import('@zxing/browser');

      const reader = new zxing.BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 80
      });

      const videoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 60 }
      };

      this.scannerActivo = true;
      this.scannerError = '';
      this.cdr.markForCheck();

      setTimeout(() => {
        const video = this.scannerVideo?.nativeElement;
        if (!video) return;

        reader
          .decodeFromConstraints(
            { video: videoConstraints, audio: false },
            video,
            (result: any) => {
              if (!result) return;

              const valor = result.getText()?.trim();
              if (!valor) return;

              this.filtrosComponent?.establecerCodigoBarra(valor);
              this.filtros.codigoBarra = valor;


              this.detenerEscaner();

              Swal.fire({
                icon: 'success',
                title: 'Código detectado',
                text: `Se buscó: ${valor}`,
                timer: 1200,
                showConfirmButton: false
              });
            }
          )
          .then((controls: any) => {
            this.scannerControls = controls;
          })
          .catch(() => {
            this.scannerError = 'No se pudo iniciar el escáner. Revisa permisos de cámara.';
            this.detenerEscaner();
          });

      }, 300);
    } catch {
      this.scannerError = 'No se pudo cargar el escáner en este navegador.';
      this.detenerEscaner();
      this.cdr.markForCheck();
    }
  }

  detenerEscaner(): void {
    if (this.scannerControls) {
      this.scannerControls.stop();
      this.scannerControls = null;
    }

    const video = this.scannerVideo?.nativeElement;

    if (video) {
      const stream = video.srcObject as MediaStream | null;

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      video.pause();
      video.srcObject = null;
    }

    this.scannerActivo = false;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.detenerEscaner();
  }

  // ===============================
  // LISTAR PRODUCTOS
  // ===============================
  getProductos(page: number = 0): void {
    if (!this.empresaId) return;

    this.loading = true;
    console.log('FILTROS ENVIADOS:', this.filtros);

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
          console.error('Error cargando productos:', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  // ===============================
  // PAGINACIÓN
  // ===============================
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.getProductos(this.currentPage + 1);
    }
  }

  previousPage(): void {
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

  onAction(event: { action: string; row: any }): void {
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
           // Mostrar imagen en un modal con opción de descargar e imprimir
           const html = `
             <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
               <img src="${imageUrl}" alt="Codigo de barra ${codigoBarra}" style="max-width:100%;height:auto;border:1px solid #e5e7eb;padding:6px;background:#fff"/>
               <div style="text-align:center;font-size:18px;font-weight:bold;font-family:'Courier New',monospace;letter-spacing:2px">
                 ${codigoBarra}
               </div>
               <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                 <button id="downloadBarcodeBtn" type="button" class="swal2-confirm swal2-styled" style="background-color:#10b981;border:none;padding:8px 16px;cursor:pointer">Descargar</button>
                 <button id="printBarcodeBtn" type="button" class="swal2-confirm swal2-styled" style="background-color:#f59e0b;border:none;padding:8px 16px;cursor:pointer">Imprimir</button>
                 <button id="closeBarcodeBtn" type="button" class="swal2-cancel swal2-styled" style="background-color:#2563eb;border:none;padding:8px 16px;cursor:pointer">Cerrar</button>
               </div>
             </div>
           `;

           Swal.fire({
             title: 'Código de Barras',
             html,
             showConfirmButton: false,
             didOpen: () => {
               const self = this;
               const downloadBtn = document.getElementById('downloadBarcodeBtn');
               const printBtn = document.getElementById('printBarcodeBtn');
               const closeBtn = document.getElementById('closeBarcodeBtn');

               if (downloadBtn) {
                 downloadBtn.addEventListener('click', () => {
                   try {
                     self.downloadBarcodeWithNumber(imagenBase64, codigoBarra);
                   } catch (e) {
                     console.error('Error descargando imagen:', e);
                     Swal.fire('Error', 'No se pudo descargar la imagen.', 'error');
                   }
                 });
               }

               if (printBtn) {
                 printBtn.addEventListener('click', () => {
                   try {
                     self.printBarcode(codigoBarra, imageUrl);
                   } catch (e) {
                     console.error('Error imprimiendo codigo de barra:', e);
                     Swal.fire('Error', 'No se pudo imprimir el codigo de barra.', 'error');
                   }
                 });
               }

               if (closeBtn) {
                 closeBtn.addEventListener('click', () => {
                   Swal.close();
                 });
               }
             }
           });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cargar la imagen del codigo de barra.', 'error');
        }
      });
    }
  }

  // ===============================
  // FILTROS
  // ===============================
  filtrarPorNombre(nombre: string): void {
    this.filtros.nombre = nombre;
    this.getProductos(0);
  }

  filtrarPorCodigoBarra(codigoBarra: string): void {
    this.filtros.codigoBarra = codigoBarra;
    this.getProductos(0);
  }

  filtrarPorEstado(estado: string): void {
    this.filtros.estado = estado;
    this.getProductos(0);
  }

  filtrarPorCategoria(nombre: string | null): void {
    this.filtros.categoria = nombre || '';
    this.getProductos(0);
  }

  filtrarPorProveedor(nombre: string | null): void {
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
          html:
            `Total filas: <b>${res.totalFilas}</b><br/>` +
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

  private downloadBarcodeWithNumber(imagenBase64: string, codigoBarra: string): void {
    const img = new Image();
    img.onload = () => {
      // Crear canvas con espacio extra para el número
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const padding = 10;
      const numberHeight = 40;

      canvas.width = img.width;
      canvas.height = img.height + numberHeight + padding * 2;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar imagen del código de barras
      ctx.drawImage(img, 0, 0);

      // Dibujar número del código de barras
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(codigoBarra, canvas.width / 2, img.height + numberHeight / 2 + padding);

      // Descargar
      canvas.toBlob((blob) => {
        if (blob) {
          this.triggerDownload(blob, `codigo-${codigoBarra}.png`);
        }
      }, 'image/png');
    };
    img.src = `data:image/png;base64,${imagenBase64}`;
  }

  private printBarcode(codigoBarra: string, imageUrl: string): void {
    const img = new Image();
    img.onload = () => {
      // Crear canvas con espacio extra para el número (igual que la descarga)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const padding = 10;
      const numberHeight = 40;

      canvas.width = img.width;
      canvas.height = img.height + numberHeight + padding * 2;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar imagen del código de barras
      ctx.drawImage(img, 0, 0);

      // Dibujar número del código de barras
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(codigoBarra, canvas.width / 2, img.height + numberHeight / 2 + padding);

      // Convertir canvas a imagen para imprimir
      const printImageUrl = canvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank', 'width=400,height=300');
      if (!printWindow) {
        return;
      }

      const print = () => {
        printWindow.focus();
        printWindow.print();
      };

      printWindow.onafterprint = () => printWindow.close();
      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Codigo de Barras ${codigoBarra}</title>
          <style>
            @page {
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20mm;
              background: #fff;
              color: #000;
              font-family: Arial, sans-serif;
            }
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10mm;
            }
            .barcode-image {
              max-width: 100%;
              height: auto;
              border: 1px solid #ccc;
              padding: 5mm;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${printImageUrl}" alt="Codigo de barra" class="barcode-image"/>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.setTimeout(print, 250);
    };
    img.src = imageUrl;
  }

  private actualizarColumnas(): void {
    if (window.innerWidth <= 480) {
      this.columns = this.columnsMobile;
    } else {
      this.columns = this.columnsDesktop;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.actualizarColumnas();
  }
}
