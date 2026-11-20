const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

function errorHttp(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validarCliente(cliente) {
  if (!cliente || typeof cliente !== 'object') {
    throw errorHttp(400, 'El pedido necesita los datos del cliente');
  }
  if (!String(cliente.nombre || '').trim()) {
    throw errorHttp(400, 'El nombre del cliente es obligatorio');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(cliente.email || '').trim())) {
    throw errorHttp(400, 'El email del cliente no es válido');
  }
  if (!String(cliente.direccion || '').trim()) {
    throw errorHttp(400, 'La dirección de envío es obligatoria');
  }
}

async function descontarStock(productoId, varianteId, cantidad) {
  return Product.findOneAndUpdate(
    {
      _id: productoId,
      variantes: {
        $elemMatch: { _id: varianteId, stock: { $gte: cantidad } },
      },
    },
    { $inc: { 'variantes.$.stock': -cantidad } },
    { returnDocument: 'after' }
  );
}

async function reponerStock(descuentos) {
  for (const descuento of descuentos) {
    await Product.updateOne(
      { _id: descuento.productoId, 'variantes._id': descuento.varianteId },
      { $inc: { 'variantes.$.stock': descuento.cantidad } }
    );
  }
}

router.get('/', async (req, res, next) => {
  try {
    const pedidos = await Order.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador de pedido no válido' });
    }

    const pedido = await Order.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const descuentos = [];

  try {
    const { cliente, lineas } = req.body;
    validarCliente(cliente);

    if (!Array.isArray(lineas) || lineas.length === 0) {
      throw errorHttp(400, 'El pedido necesita al menos una línea');
    }

    const lineasPedido = [];

    for (const linea of lineas) {
      const cantidad = Number(linea.cantidad);
      if (!Number.isInteger(cantidad) || cantidad < 1) {
        throw errorHttp(400, 'Cada línea necesita una cantidad entera mayor que cero');
      }
      if (!mongoose.isValidObjectId(linea.productoId) || !mongoose.isValidObjectId(linea.varianteId)) {
        throw errorHttp(400, 'Producto o variante no válidos');
      }

      const producto = await descontarStock(linea.productoId, linea.varianteId, cantidad);

      if (!producto) {
        const existente = await Product.findById(linea.productoId);
        if (!existente) throw errorHttp(404, 'Producto no encontrado');

        const variante = existente.variantes.id(linea.varianteId);
        if (!variante) throw errorHttp(404, `Variante no encontrada en ${existente.nombre}`);

        throw errorHttp(
          409,
          `Stock insuficiente de ${existente.nombre} (${variante.sabor}, ${variante.formato}): quedan ${variante.stock}`
        );
      }

      const variante = producto.variantes.id(linea.varianteId);
      descuentos.push({
        productoId: producto._id,
        varianteId: variante._id,
        cantidad,
      });

      lineasPedido.push({
        producto: producto._id,
        variante: variante._id,
        nombre: producto.nombre,
        sabor: variante.sabor,
        formato: variante.formato,
        precio: variante.precio,
        cantidad,
      });
    }

    const total = Number(
      lineasPedido.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0).toFixed(2)
    );

    const pedido = await Order.create({
      cliente: {
        nombre: String(cliente.nombre).trim(),
        email: String(cliente.email).trim(),
        telefono: String(cliente.telefono || '').trim(),
        direccion: String(cliente.direccion).trim(),
      },
      lineas: lineasPedido,
      total,
      estado: 'pendiente',
    });

    res.status(201).json(pedido);
  } catch (error) {
    await reponerStock(descuentos);

    if (error.status) return res.status(error.status).json({ error: error.message });
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
