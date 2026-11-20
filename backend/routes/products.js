const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();

function etiquetasDesdeQuery(valor) {
  if (!valor) return [];
  const lista = Array.isArray(valor) ? valor : String(valor).split(',');
  return lista.map((etiqueta) => etiqueta.trim()).filter(Boolean);
}

router.get('/', async (req, res, next) => {
  try {
    const filtro = {};

    if (req.query.categoria) filtro.categoria = req.query.categoria;
    if (req.query.objetivo) filtro.objetivo = req.query.objetivo;

    const etiquetas = etiquetasDesdeQuery(req.query.etiquetas);
    if (etiquetas.length) filtro.etiquetas = { $all: etiquetas };

    const productos = await Product.find(filtro).sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador de producto no válido' });
    }

    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const producto = await Product.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador de producto no válido' });
    }

    const producto = await Product.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador de producto no válido' });
    }

    const producto = await Product.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ eliminado: producto._id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
