const mongoose = require('mongoose');

const lineaSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variante: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombre: { type: String, required: true, trim: true },
    sabor: { type: String, required: true, trim: true },
    formato: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    cliente: {
      nombre: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      telefono: { type: String, trim: true, default: '' },
      direccion: { type: String, required: true, trim: true },
    },
    lineas: {
      type: [lineaSchema],
      validate: {
        validator: (lineas) => Array.isArray(lineas) && lineas.length > 0,
        message: 'El pedido necesita al menos una línea',
      },
    },
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['pendiente', 'pagado', 'enviado', 'cancelado'],
      default: 'pendiente',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
