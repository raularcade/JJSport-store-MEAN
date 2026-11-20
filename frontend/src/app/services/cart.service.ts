import { Injectable, signal, computed, effect } from '@angular/core';
import { ItemCarrito, Producto, Variante } from '../models/tienda.model';

const STORAGE_KEY = 'tienda_suplementos_carrito';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<ItemCarrito[]>(this.cargarInicial());

  totalUnidades = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  totalPrecio = computed(() =>
    Number(
      this.items()
        .reduce((acc, item) => acc + item.precio * item.cantidad, 0)
        .toFixed(2)
    )
  );

  constructor() {
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      }
    });
  }

  private cargarInicial(): ItemCarrito[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  agregar(producto: Producto, variante: Variante, cantidad = 1): void {
    if (variante.stock <= 0) return;

    this.items.update((actual) => {
      const idx = actual.findIndex((i) => i.varianteId === variante._id);
      if (idx > -1) {
        const copia = [...actual];
        const nuevaCantidad = Math.min(variante.stock, copia[idx].cantidad + cantidad);
        copia[idx] = { ...copia[idx], cantidad: nuevaCantidad, stockMax: variante.stock };
        return copia;
      }
      return [
        ...actual,
        {
          productoId: producto._id,
          varianteId: variante._id,
          nombre: producto.nombre,
          marca: producto.marca,
          sabor: variante.sabor,
          formato: variante.formato,
          precio: variante.precio,
          stockMax: variante.stock,
          cantidad: Math.min(variante.stock, cantidad),
          img: producto.img,
        },
      ];
    });
  }

  actualizarCantidad(varianteId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminar(varianteId);
      return;
    }
    this.items.update((actual) =>
      actual.map((item) =>
        item.varianteId === varianteId
          ? { ...item, cantidad: Math.min(item.stockMax, cantidad) }
          : item
      )
    );
  }

  eliminar(varianteId: string): void {
    this.items.update((actual) => actual.filter((i) => i.varianteId !== varianteId));
  }

  vaciar(): void {
    this.items.set([]);
  }
}