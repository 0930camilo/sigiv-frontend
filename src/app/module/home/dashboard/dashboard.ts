import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmpresaService, ResumenVendedor } from '../../home/dashboard/empresa/service/empresa.service';
import { UsuarioService } from '../../home/dashboard/usuario/service/usuario.service';
import { AuthService } from '../../auth/service/auth-service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { VentaService } from '../../venta/service/venta-service';
import { VentasResponse } from '../../venta/model/venta.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  usuariosActivos = 0;
  ventasDelMes = 0;
  gananciaTotal = 0;
  totalPedidos = 0;
  idEntidad = 0; // Puede ser empresa o usuario
  isEmpresa = false;
  isUsuario = false;

  // 🗓️ Variables para el rango de fechas
  fechaInicio = '';
  fechaFin = '';

  // 📊 Resumen por vendedor
  resumenVendedores: ResumenVendedor[] = [];

  // 📊 Configuración de Gráficos
  public marginsChartData: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        hoverBackgroundColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)']
      }
    ],
    labels: ['Costos', 'Ganancia']
  };

  public marginsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  public marginsChartType: ChartType = 'doughnut';

  public lineChartData: ChartData<'line'> = {
    datasets: [
      {
        data: [],
        label: 'Ventas Mensuales',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
        fill: 'origin',
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false }
    }
  };

  public lineChartType: ChartType = 'line';

  public barChartData: ChartData<'bar'> = {
    datasets: [
      {
        data: [],
        label: 'Unidades Vendidas',
        backgroundColor: 'rgba(147, 51, 234, 0.6)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1
      }
    ],
    labels: []
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    }
  };

  public barChartType: ChartType = 'bar';

  constructor(
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private ventaService: VentaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const tokenData = this.authService.getUserData();
    this.isEmpresa = tokenData?.rol === 'ROLE_EMPRESA';
    this.isUsuario = tokenData?.rol === 'ROLE_USUARIO';

    if (this.isEmpresa) {
      this.idEntidad = tokenData?.empresa_id ?? tokenData?.id ?? 0;
    } else if (this.isUsuario) {
      this.idEntidad = tokenData?.id ?? 0;
    }

    if (this.idEntidad) {
      // Establecer fechas por defecto (mes actual)
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      this.fechaInicio = `${inicioMes.getFullYear()}-${String(inicioMes.getMonth() + 1).padStart(2, '0')}-${String(inicioMes.getDate()).padStart(2, '0')}`;
      this.fechaFin = `${finMes.getFullYear()}-${String(finMes.getMonth() + 1).padStart(2, '0')}-${String(finMes.getDate()).padStart(2, '0')}`;

      this.cargarDatos();
      this.loadChartsData();
    } else {
      console.warn('⚠️ No se encontró id de empresa o usuario en el token');
    }
  }

  /** 🔹 Cargar datos según el rol */
  private cargarDatos(): void {
    if (this.isEmpresa) {
      this.cargarUsuariosActivos();
      this.cargarDatosEmpresa();
    } else if (this.isUsuario) {
      this.cargarDatosUsuario();
    }
  }

  /** 🔹 Empresa: cargar usuarios activos */
  private cargarUsuariosActivos(): void {
    this.empresaService.getUsuariosActivos(this.idEntidad).subscribe({
      next: (total: number) => {
        this.usuariosActivos = total;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Error al obtener usuarios activos:', err)
    });
  }

  /** 🔹 Empresa: cargar ventas + ganancia + resumen vendedores en paralelo */
  private cargarDatosEmpresa(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    forkJoin({
      ventas: this.empresaService.getTotalVendidoEntreFechas(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ventas empresa:', err); return of(0); })
      ),
      ganancia: this.empresaService.getGananciaTotal(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ganancia empresa:', err); return of(0); })
      ),
      resumen: this.empresaService.getResumenVendedores(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error resumen vendedores:', err); return of([] as ResumenVendedor[]); })
      )
    }).subscribe(({ ventas, ganancia, resumen }) => {
      this.ventasDelMes = ventas;
      this.gananciaTotal = ganancia;
      this.resumenVendedores = resumen;
      this.cdr.markForCheck();
    });
  }

  /** 🔹 Usuario: cargar ventas + ganancia en paralelo */
  private cargarDatosUsuario(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    forkJoin({
      ventas: this.usuarioService.getTotalVendidoEntreFechas(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ventas usuario:', err); return of(0); })
      ),
      ganancia: this.usuarioService.getGananciaTotal(this.idEntidad, this.fechaInicio, this.fechaFin).pipe(
        catchError(err => { console.error('Error ganancia usuario:', err); return of(0); })
      )
    }).subscribe(({ ventas, ganancia }) => {
      this.ventasDelMes = ventas;
      this.gananciaTotal = ganancia;
      this.cdr.markForCheck();
    });
  }

  /** 🔹 Filtrar ventas según fechas */
  filtrarVentasPorFechas(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }

    if (this.isEmpresa) this.cargarDatosEmpresa();
    else if (this.isUsuario) this.cargarDatosUsuario();
    this.loadChartsData();
  }

  /** 🔹 Cargar datos para las gráficas */
  private loadChartsData(): void {
    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) return;

    const obs = this.isEmpresa
      ? this.ventaService.getVentasByEmpresa(empresaId, 0, 100, null, this.fechaInicio, this.fechaFin)
      : this.ventaService.getVentasByUsuario(this.idEntidad, 0, 100, null, this.fechaInicio, this.fechaFin);

    obs.subscribe({
      next: (response: VentasResponse) => {
        if (response.success && response.data.ventas) {
          this.processVentasForCharts(response.data.ventas);
        }
      },
      error: (err: any) => console.error('Error cargando ventas para gráficas', err)
    });
  }

  private processVentasForCharts(ventas: any[]): void {
    // 0. Métricas básicas
    this.totalPedidos = ventas.length;
    const totalSuma = ventas.reduce((acc, v) => acc + v.total, 0);

    // 1. Procesar Ventas Mensuales
    const ventasPorMes: { [key: string]: number } = {};
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    ventas.forEach(venta => {
      const fecha = new Date(venta.fecha);
      const mes = meses[fecha.getMonth()];
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + venta.total;
    });

    // Si el rango es del mismo mes, tal vez sería mejor mostrar por días,
    // pero por ahora mantenemos meses o los que tengan datos.
    const mesesOrdenados = Object.keys(ventasPorMes).sort((a, b) => meses.indexOf(a) - meses.indexOf(b));
    this.lineChartData.labels = mesesOrdenados;
    this.lineChartData.datasets[0].data = mesesOrdenados.map(m => ventasPorMes[m]);

    // 2. Productos Más Vendidos
    const productosContador: { [key: string]: number } = {};
    ventas.forEach(venta => {
      venta.detalles?.forEach((detalle: any) => {
        productosContador[detalle.descripcionProducto] =
          (productosContador[detalle.descripcionProducto] || 0) + (detalle.cantidad || 0);
      });
    });

    const sortedProducts = Object.entries(productosContador)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.barChartData.labels = sortedProducts.map(p => p[0]);
    this.barChartData.datasets[0].data = sortedProducts.map(p => p[1]);

    // Calcular Margen de Ganancia General (Estimado)
    // Usamos el total de ventas del periodo actual
    const gananciaEstimada = totalSuma * 0.3; // Asumimos 30% como fallback
    const costosEstimados = totalSuma - gananciaEstimada;

    this.marginsChartData.datasets[0].data = [costosEstimados, gananciaEstimada];

    this.cdr.markForCheck();
    if (this.chart) {
      this.chart.update();
    }
  }
}
