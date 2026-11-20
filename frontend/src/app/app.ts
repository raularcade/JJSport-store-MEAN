import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav style="background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;">
      <div class="container" style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.9rem; padding-bottom: 0.9rem;">
        <a routerLink="/" style="font-weight: 800; font-size: 1.2rem; text-decoration: none; color: var(--text);">
          JJSPORT<span style="color: var(--primary);"> STORE</span>
        </a>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <a routerLink="/" class="btn btn-outline">Catálogo</a>
          <a routerLink="/carrito" class="btn btn-primary">
            Carrito ({{ cart.totalUnidades() }})
          </a>
        </div>
      </div>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
})
export class App {
  cart = inject(CartService);
}