const mongoose = require('mongoose');

const CATEGORIAS = ['proteinas', 'creatina', 'pre-entreno', 'vitaminas', 'hidratacion'];
const OBJETIVOS = ['hipertrofia', 'resistencia', 'recuperacion'];
const ETIQUETAS = ['vegano', 'sin-lactosa', 'sin-gluten', 'sin-cafeina'];

const nutrientesSchema = new mongoose.Schema(
  {
    energiaKcal: { type: Number, required: true, min: 0 },
    proteinas: { type: Number, required: true, min: 0 },
    hidratos: { type: Number, required: true, min: 0 },
    grasas: { type: Number, required: true, min: 0 },
    fibra: { type: Number, default: 0, min: 0 },
    sal: { type: Number, default: 0, min: 0 },
    cafeinaMg: { type: Number, min: 0 },
    creatinaG: { type: Number, min: 0 },
    sodioMg: { type: Number, min: 0 },
    potasioMg: { type: Number, min: 0 },
    magnesioMg: { type: Number, min: 0 },
    epaMg: { type: Number, min: 0 },
    dhaMg: { type: Number, min: 0 },
  },
  { _id: false }
);

const varianteSchema = new mongoose.Schema({
  sabor: { type: String, required: true, trim: true },
  formato: { type: String, required: true, trim: true },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    img: { type: String, default: '/productos/default.png', trim: true },
    marca: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIAS },
    objetivo: { type: String, required: true, enum: OBJETIVOS },
    etiquetas: {
      type: [{ type: String, enum: ETIQUETAS }],
      default: [],
    },
    dosisRecomendada: { type: String, required: true, trim: true },
    tablaNutricional: {
      por100g: { type: nutrientesSchema, required: true },
      porToma: { type: nutrientesSchema, required: true },
    },
    variantes: {
      type: [varianteSchema],
      validate: {
        validator: (variantes) => Array.isArray(variantes) && variantes.length > 0,
        message: 'El producto necesita al menos una variante',
      },
    },
  },
  { timestamps: true }
);

productSchema.index({ categoria: 1, objetivo: 1 });
productSchema.index({ etiquetas: 1 });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIAS = CATEGORIAS;
module.exports.OBJETIVOS = OBJETIVOS;
module.exports.ETIQUETAS = ETIQUETAS;
