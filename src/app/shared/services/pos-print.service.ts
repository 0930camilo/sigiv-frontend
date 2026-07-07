import { Injectable } from '@angular/core';

export interface PosPrintItem {
  descripcionProducto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface PosPrintDocument {
  tipo: 'FACTURA' | 'COTIZACION';
  numero: number;
  fecha: string;
  empresaNombre?: string;
  nombreCliente: string;
  telefonoCliente: string;
  documentoCliente?: string;
  nombreUsuario?: string;
  total: number;
  efectivo?: number;
  cambio?: number;
  detalles: PosPrintItem[];
}

@Injectable({
  providedIn: 'root'
})
export class PosPrintService {
  imprimir(documento: PosPrintDocument): void {
    const printWindow = window.open('', '_blank', 'width=380,height=640');

    if (!printWindow) {
      return;
    }

    const print = () => {
      printWindow.focus();
      printWindow.print();
    };

    printWindow.onafterprint = () => printWindow.close();
    printWindow.document.open();
    printWindow.document.write(this.buildHtml(documento));
    printWindow.document.close();
    printWindow.setTimeout(print, 250);
  }

  private buildHtml(documento: PosPrintDocument): string {
    const titulo = documento.tipo === 'FACTURA' ? 'Factura de venta' : 'Cotizacion';
    const items = documento.detalles?.length
      ? documento.detalles.map((item) => this.buildItemRow(item)).join('')
      : '<p class="empty">Sin productos</p>';

    return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${this.escapeHtml(titulo)} #${documento.numero}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #fff;
      color: #000;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.25;
    }

    .ticket {
      width: 80mm;
      padding: 4mm 3mm 8mm;
    }

    .center {
      text-align: center;
    }

    .title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0 0 2mm;
    }

    .muted {
      margin: 0;
      word-break: break-word;
    }

    .line {
      border-top: 1px dashed #000;
      margin: 2mm 0;
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 2mm;
    }

    .label {
      font-weight: 700;
    }

    .item {
      margin-bottom: 2mm;
      page-break-inside: avoid;
    }

    .item-name {
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .item-values {
      display: grid;
      grid-template-columns: 11mm 1fr 1fr;
      gap: 1mm;
      text-align: right;
    }

    .item-values span:first-child {
      text-align: left;
    }

    .total {
      font-size: 13px;
      font-weight: 700;
    }

    .empty {
      margin: 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="ticket">
    <section class="center">
      <h1 class="title">${this.escapeHtml(documento.empresaNombre || 'SIGIV')}</h1>
      <p class="muted">${this.escapeHtml(titulo)}</p>
      <p class="muted">No. ${documento.numero}</p>
    </section>

    <div class="line"></div>

    <section>
      <div class="row"><span class="label">Fecha</span><span>${this.escapeHtml(this.formatDate(documento.fecha))}</span></div>
      <div class="row"><span class="label">Cliente</span><span>${this.escapeHtml(documento.nombreCliente || 'Consumidor final')}</span></div>
      <div class="row"><span class="label">Telefono</span><span>${this.escapeHtml(documento.telefonoCliente || '-')}</span></div>
      ${documento.documentoCliente ? `<div class="row"><span class="label">Documento</span><span>${this.escapeHtml(documento.documentoCliente)}</span></div>` : ''}
      ${documento.nombreUsuario ? `<div class="row"><span class="label">Vendedor</span><span>${this.escapeHtml(documento.nombreUsuario)}</span></div>` : ''}
    </section>

    <div class="line"></div>

    <section>
      ${items}
    </section>

    <div class="line"></div>

    <section>
      <div class="row total"><span>Total</span><span>${this.formatCurrency(documento.total)}</span></div>
      ${typeof documento.efectivo === 'number' ? `<div class="row"><span>Efectivo</span><span>${this.formatCurrency(documento.efectivo)}</span></div>` : ''}
      ${typeof documento.cambio === 'number' ? `<div class="row"><span>Cambio</span><span>${this.formatCurrency(documento.cambio)}</span></div>` : ''}
    </section>

    <div class="line"></div>

    <p class="center muted">${documento.tipo === 'FACTURA' ? 'Gracias por su compra' : 'Cotizacion sujeta a disponibilidad'}</p>
  </main>
</body>
</html>`;
  }

  private buildItemRow(item: PosPrintItem): string {
    return `
      <article class="item">
        <div class="item-name">${this.escapeHtml(item.descripcionProducto)}</div>
        <div class="item-values">
          <span>${item.cantidad} x</span>
          <span>${this.formatCurrency(item.precio)}</span>
          <span>${this.formatCurrency(item.subtotal)}</span>
        </div>
      </article>`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  private formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value || '-';
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  }

  private escapeHtml(value: string | number): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
