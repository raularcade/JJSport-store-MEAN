import { Routes } from '@angular/router';
import { TiendaComponent } from './pages/tienda/tienda.component';
import { ProductoDetalleComponent } from './pages/producto-detalle/producto-detalle.component';
import { CarritoCheckoutComponent } from './pages/carrito-checkout/carrito-checkout.component';

export const routes: Routes = [
  { path: '', component: TiendaComponent },
  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'carrito', component: CarritoCheckoutComponent },
  { path: '**', redirectTo: '' },
];