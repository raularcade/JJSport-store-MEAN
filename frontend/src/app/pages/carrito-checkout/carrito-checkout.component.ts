import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { TiendaService } from '../../services/tienda.service';
import { PedidoCreado } from '../../models/tienda.model';

@Component({
  selector: 'app-carrito-checkout',
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <section class="container">
      <h1 style="font-size: 1.8rem; margin-bottom: 1.5rem;">Tu Carrito y Finalización de Compra</h1>

      @if (pedidoConfirmado(); as pedido) {
        <div class="card" style="border-color: var(--primary);">
          <span class="badge" style="margin-bottom: 0.5rem;">Pedido registrado en MongoDB</span>
          <h2>¡Gracias por tu compra, {{ pedido.cliente.nombre }}!</h2>
          <p style="color: var(--muted); margin: 0.5rem 0 1rem;">
            Referencia del pedido: <strong>{{ pedido._id }}</strong>
          </p>
          <ul style="margin-bottom: 1rem; padding-left: 1.25rem;">
            @for (l of pedido.lineas; track l.nombre + l.sabor + l.formato) {
              <li>{{ l.cantidad }}x {{ l.nombre }} ({{ l.sabor }}, {{ l.formato }}) — {{ l.precio * l.cantidad | currency:'EUR' }}</li>
            }
          </ul>
          <p style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;">Total pagado: {{ pedido.total | currency:'EUR' }}</p>
          <a routerLink="/" class="btn btn-primary" (click)="pedidoConfirmado.set(null)">Seguir comprando</a>
        </div>
      } @else if (cart.items().length === 0) {
        <div class="card">
          <p style="margin-bottom: 1rem;">Tu carrito está vacío.</p>
          <a routerLink="/" class="btn btn-primary">Ir al catálogo</a>
        </div>
      } @else {
        <div style="display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
          <div class="card">
            <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Productos ({{ cart.totalUnidades() }})</h2>
            @for (item of cart.items(); track item.varianteId) {
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border); gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <img
                    [src]="item.img || '/productos/default.jpg'"
                    [alt]="item.nombre"
                    (error)="onImageError($event)"
                    style="width: 56px; height: 56px; object-fit: contain; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 0.25rem; flex-shrink: 0;"
                  />
                  <div>
                    <strong>{{ item.nombre }}</strong>
                    <div style="font-size: 0.85rem; color: var(--muted);">{{ item.sabor }} · {{ item.formato }}</div>
                    <div style="font-weight: 600;">{{ item.precio | currency:'EUR' }} / ud.</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <button type="button" class="btn btn-outline" (click)="cart.actualizarCantidad(item.varianteId, item.cantidad - 1)">-</button>
                  <span style="min-width: 1.5rem; text-align: center; font-weight: 600;">{{ item.cantidad }}</span>
                  <button type="button" class="btn btn-outline" [disabled]="item.cantidad >= item.stockMax" (click)="cart.actualizarCantidad(item.varianteId, item.cantidad + 1)">+</button>
                  <button type="button" class="btn btn-danger" (click)="cart.eliminar(item.varianteId)">✕</button>
                </div>
              </div>
            }
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 1.25rem;">
              <strong>Total:</strong>
              <strong>{{ cart.totalPrecio() | currency:'EUR' }}</strong>
            </div>
          </div>

          <form class="card" (ngSubmit)="confirmarPedido()" style="display: flex; flex-direction: column; gap: 0.85rem;">
            <h2 style="font-size: 1.2rem;">Datos de envío</h2>

            <div>
              <label>Nombre completo *</label>
              <input type="text" name="nombre" [(ngModel)]="cliente.nombre" required placeholder="Ej. Laura García" />
            </div>

            <div>
              <label>Correo electrónico *</label>
              <input type="email" name="email" [(ngModel)]="cliente.email" required placeholder="laura@ejemplo.com" />
            </div>

            <div>
              <label>Teléfono</label>
              <input type="tel" name="telefono" [(ngModel)]="cliente.telefono" placeholder="600 000 000" />
            </div>

            <div>
              <label>Dirección de entrega *</label>
              <textarea name="direccion" rows="2" [(ngModel)]="cliente.direccion" required placeholder="Calle, número, código postal y ciudad"></textarea>
            </div>

            @if (errorPedido()) {
              <p style="color: var(--danger); font-size: 0.9rem; font-weight: 600;">{{ errorPedido() }}</p>
            }

            <button type="submit" class="btn btn-primary" [disabled]="enviando()">
              {{ enviando() ? 'Procesando pedido...' : 'Confirmar pedido' }}
            </button>
          </form>
        </div>
      }
    </section>
  `,
})
export class CarritoCheckoutComponent {
  cart = inject(CartService);
  private tiendaService = inject(TiendaService);

  cliente = { nombre: '', email: '', telefono: '', direccion: '' };
  enviando = signal(false);
  errorPedido = signal('');
  pedidoConfirmado = signal<PedidoCreado | null>(null);

  confirmarPedido(): void {
    this.errorPedido.set('');
    this.enviando.set(true);

    const payload = {
      cliente: this.cliente,
      lineas: this.cart.items().map((i) => ({
        productoId: i.productoId,
        varianteId: i.varianteId,
        cantidad: i.cantidad,
      })),
    };

    this.tiendaService.crearPedido(payload).subscribe({
      next: (pedido) => {
        this.pedidoConfirmado.set(pedido);
        this.cart.vaciar();
        this.enviando.set(false);
      },
      error: (err) => {
        this.errorPedido.set(err.error?.error || 'Error al procesar el pedido.');
        this.enviando.set(false);
      },
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = '/productos/default.jpg';
    }
  }
}