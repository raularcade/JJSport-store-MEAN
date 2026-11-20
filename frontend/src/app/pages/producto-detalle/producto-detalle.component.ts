import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TiendaService } from '../../services/tienda.service';
import { CartService } from '../../services/cart.service';
import { Producto, Variante, Nutrientes } from '../../models/tienda.model';

@Component({
  selector: 'app-producto-detalle',
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <section class="container">
      <a routerLink="/" class="btn btn-outline" style="margin-bottom: 1.25rem;">← Volver al catálogo</a>

      @if (cargando()) {
        <p>Cargando ficha nutricional...</p>
      } @else if (producto(); as prod) {
        <div style="display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
          <div class="card">
            <img
              [src]="prod.img || '/productos/default.jpg'"
              [alt]="prod.nombre"
              (error)="onImageError($event)"
              style="width: 100%; height: 260px; object-fit: contain; background: #f8fafc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;"
            />

            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
              <span class="badge">{{ prod.categoria }}</span>
              <span class="badge badge-gray">{{ prod.objetivo }}</span>
            </div>
            <small style="color: var(--muted); font-weight: 600;">{{ prod.marca }}</small>
            <h1 style="font-size: 1.75rem; margin: 0.25rem 0 0.75rem;">{{ prod.nombre }}</h1>
            <p style="color: var(--muted); margin-bottom: 1rem;">{{ prod.descripcion }}</p>

            <div style="background: #f1f5f9; padding: 0.85rem; border-radius: 8px; margin-bottom: 1.25rem;">
              <strong>Dosis recomendada:</strong> {{ prod.dosisRecomendada }}
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: 600; margin-bottom: 0.4rem;">1. Elige sabor:</label>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                @for (sabor of saboresUnicos(); track sabor) {
                  <button
                    type="button"
                    class="btn"
                    [class.btn-primary]="saborSeleccionado() === sabor"
                    [class.btn-outline]="saborSeleccionado() !== sabor"
                    (click)="seleccionarSabor(sabor)">
                    {{ sabor }}
                  </button>
                }
              </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-weight: 600; margin-bottom: 0.4rem;">2. Elige formato:</label>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                @for (variante of variantesPorSabor(); track variante._id) {
                  <button
                    type="button"
                    class="btn"
                    [class.btn-primary]="varianteActual()?._id === variante._id"
                    [class.btn-outline]="varianteActual()?._id !== variante._id"
                    (click)="varianteActual.set(variante)">
                    {{ variante.formato }} ({{ variante.precio | currency:'EUR' }})
                  </button>
                }
              </div>
            </div>

            @if (varianteActual(); as v) {
              <div style="border-top: 1px solid var(--border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="font-size: 1.6rem; display: block;">{{ v.precio | currency:'EUR' }}</strong>
                  <span [style.color]="v.stock > 0 ? 'var(--primary)' : 'var(--danger)'" style="font-size: 0.85rem; font-weight: 600;">
                    {{ v.stock > 0 ? 'En stock (' + v.stock + ' uds.)' : 'Agotado' }}
                  </span>
                </div>
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="v.stock <= 0"
                  (click)="anadirAlCarrito(prod, v)">
                  Añadir al carrito
                </button>
              </div>
              @if (mensajeAnadido()) {
                <p style="color: var(--primary); font-weight: 600; margin-top: 0.75rem;">✓ Añadido al carrito</p>
              }
            }
          </div>

          <div class="card">
            <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">Información Nutricional</h2>
            @if (filasNutricionales().length) {
              <table style="width: 100%; border-collapse: collapse; font-size: 0.92rem;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                    <th style="padding: 0.5rem;">Nutriente</th>
                    <th style="padding: 0.5rem;">Por 100 g</th>
                    <th style="padding: 0.5rem;">Por toma</th>
                  </tr>
                </thead>
                <tbody>
                  @for (fila of filasNutricionales(); track fila.label) {
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 0.5rem; font-weight: 500;">{{ fila.label }}</td>
                      <td style="padding: 0.5rem;">{{ fila.p100 }}</td>
                      <td style="padding: 0.5rem;">{{ fila.pToma }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p style="color: var(--muted);">Tabla nutricional disponible en el envase del producto.</p>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class ProductoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tiendaService = inject(TiendaService);
  private cartService = inject(CartService);

  producto = signal<Producto | null>(null);
  cargando = signal(true);
  saborSeleccionado = signal('');
  varianteActual = signal<Variante | null>(null);
  mensajeAnadido = signal(false);

  saboresUnicos = computed(() => {
    const vars = this.producto()?.variantes ?? [];
    return [...new Set(vars.map((v) => v.sabor))];
  });

  variantesPorSabor = computed(() => {
    const vars = this.producto()?.variantes ?? [];
    return vars.filter((v) => v.sabor === this.saborSeleccionado());
  });

  filasNutricionales = computed(() => {
    const p = this.producto();
    if (!p) return [];
    const p100: Partial<Nutrientes> = p.tablaNutricional?.por100g || p.nutrientesPor100g || {};
    const pToma: Partial<Nutrientes> = p.tablaNutricional?.porToma || p.nutrientesPorToma || {};

    const campos: { key: keyof Nutrientes; label: string; unidad: string }[] = [
      { key: 'energiaKcal', label: 'Valor energético', unidad: ' kcal' },
      { key: 'proteinas', label: 'Proteínas', unidad: ' g' },
      { key: 'hidratos', label: 'Hidratos de carbono', unidad: ' g' },
      { key: 'grasas', label: 'Grasas', unidad: ' g' },
      { key: 'fibra', label: 'Fibra', unidad: ' g' },
      { key: 'sal', label: 'Sal', unidad: ' g' },
      { key: 'creatinaG', label: 'Creatina', unidad: ' g' },
      { key: 'cafeinaMg', label: 'Cafeína', unidad: ' mg' },
      { key: 'sodioMg', label: 'Sodio', unidad: ' mg' },
      { key: 'potasioMg', label: 'Potasio', unidad: ' mg' },
      { key: 'magnesioMg', label: 'Magnesio', unidad: ' mg' },
      { key: 'epaMg', label: 'EPA', unidad: ' mg' },
      { key: 'dhaMg', label: 'DHA', unidad: ' mg' },
    ];

    return campos
      .filter((c) => p100[c.key] !== undefined || pToma[c.key] !== undefined)
      .map((c) => ({
        label: c.label,
        p100: p100[c.key] !== undefined ? `${p100[c.key]}${c.unidad}` : '-',
        pToma: pToma[c.key] !== undefined ? `${pToma[c.key]}${c.unidad}` : '-',
      }));
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tiendaService.getProductoPorId(id).subscribe({
        next: (prod) => {
          this.producto.set(prod);
          if (prod.variantes?.length) {
            this.saborSeleccionado.set(prod.variantes[0].sabor);
            this.varianteActual.set(prod.variantes[0]);
          }
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
    }
  }

  seleccionarSabor(sabor: string): void {
    this.saborSeleccionado.set(sabor);
    const primera = this.variantesPorSabor()[0] ?? null;
    this.varianteActual.set(primera);
  }

  anadirAlCarrito(prod: Producto, v: Variante): void {
    this.cartService.agregar(prod, v, 1);
    this.mensajeAnadido.set(true);
    setTimeout(() => this.mensajeAnadido.set(false), 2000);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = '/productos/default.jpg';
    }
  }
}