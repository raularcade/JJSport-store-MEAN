# JJSPORT STORE

Tienda online de suplementación deportiva desarrollada en local con el stack MEAN (MongoDB, Express, Angular y Node.js).

## Funcionalidades

- Catálogo de productos con filtros por categoría, objetivo y etiquetas.
- Ficha de detalle con selector de sabor y tamaño, stock disponible y tabla nutricional.
- Carrito.
- Formulario de pedido conectado a MongoDB con descuento automático de stock.

## Stack

- **Frontend:** Angular
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB con Mongoose

## Arranque en local

Requisitos: tener **Node.js** instalado y **MongoDB** ejecutándose en `127.0.0.1:27017`.

**1. Backend**
```bash
cd backend
npm install
npm run seed
npm run dev
```
La API queda escuchando en `http://localhost:4000`.

**2. Frontend**
```bash
cd frontend
npm install
npm start
```
La tienda abre en `http://localhost:4200`.