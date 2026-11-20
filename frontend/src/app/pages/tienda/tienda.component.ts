import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TiendaService } from '../../services/tienda.service';
import { Producto } from '../../models/tienda.model';

@Component({
  selector: 'app-tienda',
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <section class="container">
      <header style="margin-bottom: 1.5rem;">
        <h1 style="font-size: 1.8rem;">Descubre todos nuestros productos</h1>
        <p style="color: var(--muted);">Filtra por objetivo, categoría o requerimientos dietéticos.</p>
      </header>

      <div class="card" style="margin-bottom: 1.5rem; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div>
          <label style="font-size: 0.85rem; font-weight: 600;">Categoría</label>
          <select [(ngModel)]="categoriaSeleccionada" (change)="buscar()">
            <option value="">Todas las categorías</option>
            <option value="proteinas">Proteínas</option>
            <option value="creatina">Creatina</option>
            <option value="pre-entreno">Pre-entreno</option>
            <option value="vitaminas">Vitaminas</option>
            <option value="hidratacion">Hidratación</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.85rem; font-weight: 600;">Objetivo</label>
          <select [(ngModel)]="objetivoSeleccionado" (change)="buscar()">
            <option value="">Todos los objetivos</option>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="resistencia">Resistencia</option>
            <option value="recuperacion">Recuperación</option>
          </select>
        </div>

        <div style="grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
          <span style="font-size: 0.85rem; font-weight: 600;">Etiquetas:</span>
          @for (etiqueta of etiquetasDisponibles; track etiqueta) {
            <button
              type="button"
              class="btn"
              [class.btn-primary]="etiquetasActivas().includes(etiqueta)"
              [class.btn-outline]="!etiquetasActivas().includes(etiqueta)"
              (click)="toggleEtiqueta(etiqueta)">
              {{ etiqueta }}
            </button>
          }
          @if (categoriaSeleccionada || objetivoSeleccionado || etiquetasActivas().length) {
            <button type="button" class="btn btn-danger" (click)="limpiarFiltros()">Limpiar filtros</button>
          }
        </div>
      </div>

      @if (cargando()) {
        <p>Cargando catálogo...</p>
      } @else if (error()) {
        <div class="card" style="border-color: var(--danger); color: var(--danger);">{{ error() }}</div>
      } @else if (productos().length === 0) {
        <div class="card">No hay suplementos que coincidan con esos filtros.</div>
      } @else {
        <div class="grid-cards">
          @for (prod of productos(); track prod._id) {
            <article class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
              <img [src]="prod.img || '/productos/default.jpg'" [alt]="prod.nombre"
                    style="width: 100%; height: 180px; object-fit: contain; background: #f8fafc; border-radius: 0.5rem; padding: 0.5rem;"/>
              <div>
                <div style="display: flex; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <span class="badge">{{ prod.categoria }}</span>
                  <span class="badge badge-gray">{{ prod.objetivo }}</span>
                </div>
                <small style="color: var(--muted); font-weight: 600;">{{ prod.marca }}</small>
                <h2 style="font-size: 1.15rem; margin: 0.2rem 0 0.5rem;">{{ prod.nombre }}</h2>
                <p style="font-size: 0.9rem; color: var(--muted);">{{ prod.descripcion }}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.75rem;">
                  @for (et of prod.etiquetas; track et) {
                    <span class="badge badge-gray">{{ et }}</span>
                  }
                </div>
              </div>

              <div style="border-top: 1px solid var(--border); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-size: 0.8rem; color: var(--muted); display: block;">Desde</span>
                  <strong style="font-size: 1.2rem;">{{ precioMinimo(prod) | currency:'EUR' }}</strong>
                </div>
                <a [routerLink]="['/producto', prod._id]" class="btn btn-primary">Ver formatos</a>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class TiendaComponent implements OnInit {
  private tiendaService = inject(TiendaService);

  productos = signal<Producto[]>([]);
  cargando = signal(true);
  error = signal('');

  categoriaSeleccionada = '';
  objetivoSeleccionado = '';
  etiquetasDisponibles = ['vegano', 'sin-lactosa', 'sin-gluten', 'sin-cafeina'];
  etiquetasActivas = signal<string[]>([]);

  ngOnInit(): void {
    this.buscar();
  }

  toggleEtiqueta(etiqueta: string): void {
    this.etiquetasActivas.update((lista) =>
      lista.includes(etiqueta) ? lista.filter((e) => e !== etiqueta) : [...lista, etiqueta]
    );
    this.buscar();
  }

  limpiarFiltros(): void {
    this.categoriaSeleccionada = '';
    this.objetivoSeleccionado = '';
    this.etiquetasActivas.set([]);
    this.buscar();
  }

  buscar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.tiendaService
      .getProductos({
        categoria: this.categoriaSeleccionada || undefined,
        objetivo: this.objetivoSeleccionado || undefined,
        etiquetas: this.etiquetasActivas(),
      })
      .subscribe({
        next: (data) => {
          this.productos.set(data);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo conectar con el servidor Express en http://localhost:4000.');
          this.cargando.set(false);
        },
      });
  }

  precioMinimo(prod: Producto): number {
    if (!prod.variantes?.length) return 0;
    return Math.min(...prod.variantes.map((v) => v.precio));
  }
}