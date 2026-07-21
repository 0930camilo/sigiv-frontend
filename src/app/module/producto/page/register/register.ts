import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProductoService } from '../../service/producto-service';
import { ProductoCreateRequest } from '../../model/productos.model';
import { CategoriaService } from '../../../categorias/service/categoria-service';
import { ProveedorService } from '../../../proveedor/service/proveedor-service';
import { AuthService } from '../../../auth/service/auth-service';
import { UserService } from '../../../users/service/user-service';



@Component({
  selector: 'app-register-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterProducto implements OnInit, OnDestroy {

  @ViewChild('scannerVideo') scannerVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('codigoInput') codigoInput!: ElementRef;
  @Output() productoCreado = new EventEmitter<any>();

  mostrarModal = false;
  creandoProducto = false;
  formProducto!: FormGroup;

  // Escaner
  scannerActivo = false;
  scannerError = '';
  private scannerControls: { stop: () => void } | null = null;

  categorias: any[] = [];
  proveedores: any[] = [];

  //empresaId: number = Number(localStorage.getItem("empresaId"));}
  empresaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
   this.empresaId = this.authService.getEmpresaId();
  }

  ngOnDestroy(): void {
    this.detenerEscaner();
  }

  private initForm(): void {
    this.formProducto = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      cantidad: [0, Validators.required],
      precioCompra: [0, Validators.required],
      precio: [0, Validators.required],
      codigoBarra: [''],
      estado: ['Activo', Validators.required],
      categoriaId: [null, Validators.required],
      proveedorId: [null, Validators.required]
    });
  }

  abrirModal(): void {
  this.mostrarModal = true;
  this.cargarCategorias();
  this.cargarProveedores();
  setTimeout(() => {
    this.codigoInput?.nativeElement.focus();
  }, 300);
}

  cerrarModal(): void {
    this.mostrarModal = false;
    this.detenerEscaner();

    this.formProducto.reset({
      estado: 'Activo',
      cantidad: 0,
      precio: 0,
      precioCompra: 0,
      codigoBarra: '',
      categoriaId: null,
      proveedorId: null
    });
  }

  // ===============================
  // ESCÁNER
  // ===============================
  async iniciarEscaner(): Promise<void> {
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
            (result: { getText: () => string } | undefined) => {
              if (!result) return;

              const valor = result.getText()?.trim();
              if (!valor) return;

              this.formProducto.patchValue({ codigoBarra: valor });
              this.detenerEscaner();
              Swal.fire('Código detectado', `Se escaneó: ${valor}`, 'success');
              this.cdr.markForCheck();
            }
          )
          .then((controls: { stop: () => void }) => {
            this.scannerControls = controls;
          })
          .catch(() => {
            this.scannerError = 'No se pudo iniciar el escáner. Revisa permisos de cámara.';
            this.detenerEscaner();
          });
      }, 350);
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
      video.pause();
      video.srcObject = null;
    }

    this.scannerActivo = false;
    this.cdr.markForCheck();
  }

  // ===============================
  // Categorías
  // ===============================
  cargarCategorias() {
  console.log("Empresa enviada >>> ", this.empresaId); // 👈 IMPORTANTÍSIMO

  this.categoriaService.getCategoriasByEmpresa(this.empresaId!).subscribe({
    next: (res) => {
      console.log("Respuesta categorías:", res);
      this.categorias = res.data.categorias || [];
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error("Error cargando categorías:", err);
      Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
    }
  });
}

cargarProveedores() {
  if (!this.empresaId) return;

  this.proveedorService
    .getProveedoresByEmpresa(this.empresaId, 0, 1000)
    .subscribe({
      next: (res) => {
        console.log("Respuesta proveedores:", res);
        this.proveedores = res.data?.proveedores || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Error cargando proveedores:", err);
        Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
      }
    });
}


  // ===============================
  //  Crear Producto
  // ===============================
  crearProducto(): void {

    if (this.formProducto.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios.'
      });
      return;
    }

    const payload: ProductoCreateRequest = this.formProducto.value;
    this.creandoProducto = true;

    this.productoService.createProducto(payload).subscribe({
      next: (res) => {
        this.creandoProducto = false;
        this.cerrarModal();
        this.productoCreado.emit(res.data);
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'success',
          title: 'Producto creado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: () => {
        this.creandoProducto = false;
        this.cdr.markForCheck();
        Swal.fire('Error', 'Error al crear producto', 'error');
      }
    });
  }
}
