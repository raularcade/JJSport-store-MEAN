import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, PedidoPayload, PedidoCreado } from '../models/tienda.model';

@Injectable({ providedIn: 'root' })
export class TiendaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api';

  getProductos(filtros?: {
    categoria?: string;
    objetivo?: string;
    etiquetas?: string[];
  }): Observable<Producto[]> {
    let params = new HttpParams();
    if (filtros?.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros?.objetivo) params = params.set('objetivo', filtros.objetivo);
    if (filtros?.etiquetas?.length) {
      params = params.set('etiquetas', filtros.etiquetas.join(','));
    }
    return this.http.get<Producto[]>(`${this.apiUrl}/products`, { params });
  }

  getProductoPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/products/${id}`);
  }

  crearPedido(payload: PedidoPayload): Observable<PedidoCreado> {
    return this.http.post<PedidoCreado>(`${this.apiUrl}/orders`, payload);
  }
}