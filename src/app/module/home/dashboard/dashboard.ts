import { ChangeDetectorRef, Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmpresaService, ResumenVendedor } from '../../home/dashboard/empresa/service/empresa.service';
import { UsuarioService } from '../../home/dashboard/usuario/service/usuario.service';
import { AuthService } from '../../auth/service/auth-service';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  registerables
} from 'chart.js';
import { VentaService } from '../../venta/service/venta-service';
import { VentasResponse } from '../../venta/model/venta.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})



export class Dashboard implements OnInit {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

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
  public categoryChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ]
    }]
  };

  public categoryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  public categoryChartType: ChartType = 'pie';

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

        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',   // Azul
          'rgba(16, 185, 129, 0.6)',   // Verde
          'rgba(245, 158, 11, 0.6)',   // Amarillo
          'rgba(147, 51, 234, 0.6)',   // Morado
          'rgba(239, 68, 68, 0.6)' ,     // Rojo
          'rgba(6, 182, 212, 0.7)',    // Cyan
          'rgba(236, 72, 153, 0.7)',   // Rosa
          'rgba(99, 102, 241, 0.7)',   // Índigo
          'rgba(132, 204, 22, 0.7)',   // Lima
          'rgba(249, 115, 22, 0.7)',   // Naranja
          'rgba(20, 184, 166, 0.7)',   // Teal
        ],

        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(147, 51, 234)',
          'rgb(239, 68, 68)'
        ],

        borderWidth: 1,
        borderRadius: 6
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
      console.log('🚀 Iniciando carga de Dashboard con idEntidad:', this.idEntidad);
      // Establecer fechas por defecto (últimos 7 días)
      const hoy = new Date();
      const hace7Dias = new Date();
      hace7Dias.setDate(hoy.getDate() - 6);

      this.fechaInicio = hace7Dias.toISOString().split('T')[0];
      this.fechaFin = hoy.toISOString().split('T')[0];

      console.log('📅 Fechas por defecto (7 días):', { inicio: this.fechaInicio, fin: this.fechaFin });
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
    const tokenData = this.authService.getUserData();
    const idEntidadReal = tokenData?.id ?? this.idEntidad;

    console.log('🔍 Preparando carga de gráficas:', {
      isEmpresa: this.isEmpresa,
      isUsuario: this.isUsuario,
      empresaId,
      idEntidad: this.idEntidad,
      idEntidadReal,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    });

    if (!empresaId && this.isEmpresa) {
      console.warn('⚠️ No hay empresaId para cargar gráficas de empresa');
      return;
    }

    const obs = this.isEmpresa
      ? this.ventaService.getVentasByEmpresa(empresaId!, 0, 500, null, this.fechaInicio, this.fechaFin)
      : this.ventaService.getVentasByUsuario(idEntidadReal, 0, 500, null, this.fechaInicio, this.fechaFin);

    console.log('📡 URL de consulta tentativa:', this.isEmpresa
      ? `ventas/empresa/${empresaId}/ventas?page=0&size=500&fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}`
      : `ventas/usuario/${idEntidadReal}/ventas?page=0&size=500&fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}`
    );

    console.log('📡 Ejecutando consulta de ventas...');

    obs.subscribe({
      next: (response: VentasResponse) => {
      console.log('📡 Respuesta de ventas completa:', response);
      // Validar si la data está en un nivel diferente o si el campo se llama distinto
      let listaVentas: any[] = [];
      if (response && response.data && Array.isArray(response.data.ventas)) {
        listaVentas = response.data.ventas;
      } else if (response && Array.isArray((response as any).ventas)) {
        listaVentas = (response as any).ventas;
      } else if (response && Array.isArray(response.data)) {
        listaVentas = response.data as any;
      } else if (response && Array.isArray(response)) {
        listaVentas = response as any;
      }

      if (listaVentas.length > 0) {
        console.log('✅ Ventas encontradas:', listaVentas.length);
        this.processVentasForCharts(listaVentas);
      } else {
        console.warn('⚠️ No se encontró un array de ventas válido en la respuesta:', response);
        this.processVentasForCharts([]);
      }
      },
      error: (err: any) => {
        console.error('❌ Error cargando ventas para gráficas', err);
        this.processVentasForCharts([]);
      }
    });
  }

  private processVentasForCharts(ventas: any[]): void {
    // 0. Métricas básicas
    this.totalPedidos = ventas.length;
    const totalSuma = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

    console.log('📊 Procesando ventas para gráficas:', this.totalPedidos);

    // 1. Procesar Ventas Mensuales o Diarias
    const ventasAgrupadas: { [key: string]: number } = {};
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Determinar si el rango es del mismo mes para agrupar por días
    let agruparPorDia = false;
    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio + 'T00:00:00');
      const fin = new Date(this.fechaFin + 'T23:59:59');
      // Si el rango es menor o igual a 31 días, agrupamos por día para mayor detalle
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      agruparPorDia = diffDays <= 31;
    }

    ventas.forEach(venta => {
      // Intentar forzar el parseo de la fecha si viene en formato extraño
      let fechaStr = venta.fecha;
      if (fechaStr && typeof fechaStr === 'string' && fechaStr.includes(' ')) {
        fechaStr = fechaStr.split(' ')[0]; // Quedarse solo con la parte YYYY-MM-DD
      }

      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) {
        console.warn('📅 Fecha inválida en venta (original):', venta.fecha, 'intentado:', fechaStr);
        return;
      }

      // IMPORTANTE: Para evitar problemas de zona horaria, usamos UTC o ajustamos
      // para que el día sea el correcto según el string
      const dia = fecha.getUTCDate();
      const mes = fecha.getUTCMonth();

      let label = '';
      if (agruparPorDia) {
        label = `${dia} ${meses[mes]}`;
      } else {
        label = meses[mes];
      }

      ventasAgrupadas[label] = (ventasAgrupadas[label] || 0) + (venta.total || 0);
    });

    // Ordenar las etiquetas cronológicamente
    let labelsOrdenadas: string[] = [];
    if (agruparPorDia) {
      // Ordenar por fecha real si es por día
      labelsOrdenadas = Object.keys(ventasAgrupadas).sort((a, b) => {
        const numA = parseInt(a.split(' ')[0]);
        const numB = parseInt(b.split(' ')[0]);
        return numA - numB;
      });
    } else {
      labelsOrdenadas = Object.keys(ventasAgrupadas).sort((a, b) => meses.indexOf(a) - meses.indexOf(b));
    }

    console.log('📊 Ventas agrupadas calculadas:', ventasAgrupadas);
    console.log('📊 Labels ordenadas:', labelsOrdenadas);

    this.lineChartData = {
      labels: labelsOrdenadas,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: labelsOrdenadas.map(l => ventasAgrupadas[l])
        }
      ]
    };

    // 2. Productos Más Vendidos
    const productosContador: { [key: string]: number } = {};
    ventas.forEach(venta => {
      const detalles = venta.detalles || (venta as any).ventaDetalles || [];
      detalles.forEach((detalle: any) => {
        const nombreProd = detalle.descripcionProducto || detalle.productoNombre || 'Producto';
        productosContador[nombreProd] =
          (productosContador[nombreProd] || 0) + (detalle.cantidad || 0);
      });
    });

    const sortedProducts = Object.entries(productosContador)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log('📊 Productos Top 10:', sortedProducts);

    this.barChartData = {
      labels: sortedProducts.map(p => p[0]),
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: sortedProducts.map(p => p[1])
        }
      ]
    };

    // 3. Ventas por Categoría
    const categoriasContador: { [key: string]: number } = {};
    ventas.forEach(venta => {
      const detalles = venta.detalles || (venta as any).ventaDetalles || [];
      detalles.forEach((detalle: any) => {
        const cat = detalle.categoriaNombre || detalle.categoria || 'Sin Categoría';
        categoriasContador[cat] = (categoriasContador[cat] || 0) + (detalle.subtotal || 0);
      });
    });

    this.categoryChartData = {
      labels: Object.keys(categoriasContador),
      datasets: [{
        ...this.categoryChartData.datasets[0],
        data: Object.values(categoriasContador)
      }]
    };

    // Calcular Margen de Ganancia General (Estimado)
    // Usamos el total de ventas del periodo actual
    const gananciaEstimada = this.gananciaTotal || (totalSuma * 0.3); // Usar ganancia real si existe
    const costosEstimados = Math.max(0, totalSuma - gananciaEstimada);

    this.marginsChartData = {
      datasets: [{
        data: [costosEstimados, gananciaEstimada],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        hoverBackgroundColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)']
      }],
      labels: ['Costos', 'Ganancia']
    };

    console.log('📊 Datos finales para gráfico de líneas:', {
      labels: this.lineChartData.labels,
      data: this.lineChartData.datasets[0].data
    });

    console.log('📊 Forzando actualización de las directivas Chart...');
    this.cdr.detectChanges(); // Forzar detección de cambios sincrónica

    setTimeout(() => {
      this.charts?.forEach(chart => {
        chart.update();
      });
      console.log('✅ Update ejecutado en todas las gráficas');
    }, 0);
  }
}
