require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tiendagym';

const productos = [
  {
    nombre: 'Gold Standard 100% Isolate',
    img: '/productos/Hydrowhey.jpg',
    marca: 'Optimum Nutrition',
    descripcion:
      'Proteína aislada de suero por microfiltración. Alta en proteína por toma y muy baja en lactosa, para cubrir la ingesta en etapas de hipertrofia.',
    categoria: 'proteinas',
    objetivo: 'hipertrofia',
    etiquetas: ['sin-lactosa', 'sin-gluten'],
    dosisRecomendada: '30 g (1 cacito) al día, mezclados con 200-250 ml de agua, después de entrenar.',
    tablaNutricional: {
      por100g: { energiaKcal: 370, proteinas: 90, hidratos: 3.3, grasas: 1.7, fibra: 0, sal: 0.7 },
      porToma: { energiaKcal: 111, proteinas: 27, hidratos: 1, grasas: 0.5, fibra: 0, sal: 0.2 },
    },
    variantes: [
      { sabor: 'Vainilla', formato: '930 g', precio: 44.9, stock: 36 },
      { sabor: 'Chocolate', formato: '930 g', precio: 44.9, stock: 28 },
      { sabor: 'Vainilla', formato: '2,27 kg', precio: 89.9, stock: 12 },
    ],
  },
  {
    nombre: 'Gold Standard 100% Whey',
    img: '/productos/gold_whey.jpg',
    marca: 'Optimum Nutrition',
    descripcion:
      'Concentrado de suero con isolate añadido. El batido clásico de hipertrofia: 24 g de proteína por toma y buena disolución.',
    categoria: 'proteinas',
    objetivo: 'hipertrofia',
    etiquetas: ['sin-gluten'],
    dosisRecomendada: '30 g (1 cacito) al día, mezclados con 200 ml de agua o leche.',
    tablaNutricional: {
      por100g: { energiaKcal: 400, proteinas: 77, hidratos: 8, grasas: 6, fibra: 1, sal: 0.8 },
      porToma: { energiaKcal: 120, proteinas: 24, hidratos: 3, grasas: 1.5, fibra: 0.3, sal: 0.25 },
    },
    variantes: [
      { sabor: 'Doble chocolate', formato: '900 g', precio: 32.9, stock: 48 },
      { sabor: 'Fresa', formato: '900 g', precio: 32.9, stock: 22 },
      { sabor: 'Cookies & cream', formato: '2,27 kg', precio: 64.9, stock: 15 },
    ],
  },
  {
    nombre: 'Creatina monohidrato Creapure',
    img: '/productos/creatina1.jpg',
    marca: 'Creapure',
    descripcion:
      'Creatina monohidrato Creapure, el grado alemán micronizado. 5 g aportan 5 g de creatina pura, sin sabor ni estimulantes.',
    categoria: 'creatina',
    objetivo: 'hipertrofia',
    etiquetas: ['vegano', 'sin-lactosa', 'sin-gluten', 'sin-cafeina'],
    dosisRecomendada: '5 g al día, todos los días, disueltos en agua o en el batido. No hace falta fase de carga.',
    tablaNutricional: {
      por100g: { energiaKcal: 0, proteinas: 0, hidratos: 0, grasas: 0, fibra: 0, sal: 0, creatinaG: 100 },
      porToma: { energiaKcal: 0, proteinas: 0, hidratos: 0, grasas: 0, fibra: 0, sal: 0, creatinaG: 5 },
    },
    variantes: [
      { sabor: 'Neutro', formato: '300 g', precio: 24.9, stock: 60 },
      { sabor: 'Neutro', formato: '500 g', precio: 34.9, stock: 34 },
    ],
  },
  {
    nombre: 'C4 Original',
    img: '/productos/c4.jpg',
    marca: 'Cellucor',
    descripcion:
      'Pre-entreno con 150 mg de cafeína por toma, beta-alanina y citrulina. Sube la intensidad en sesiones de fuerza e hipertrofia.',
    categoria: 'pre-entreno',
    objetivo: 'hipertrofia',
    etiquetas: [],
    dosisRecomendada: '1 cacito (6,5 g) con 150-200 ml de agua, 20-30 minutos antes de entrenar. No superar 2 tomas al día.',
    tablaNutricional: {
      por100g: { energiaKcal: 154, proteinas: 0, hidratos: 23, grasas: 0, fibra: 0, sal: 0.4, cafeinaMg: 2308 },
      porToma: { energiaKcal: 10, proteinas: 0, hidratos: 1.5, grasas: 0, fibra: 0, sal: 0.03, cafeinaMg: 150 },
    },
    variantes: [
      { sabor: 'Fruta explosiva', formato: '390 g', precio: 34.95, stock: 26 },
      { sabor: 'Sandía', formato: '390 g', precio: 34.95, stock: 18 },
    ],
  },
  {
    nombre: 'Stim-Free Pre-Workout',
    img: '/productos/stim-free-preworkout.jpg',
    marca: 'Transparent Labs',
    descripcion:
      'Pre-entreno sin estimulantes: citrulina malato y beta-alanina para el rendimiento, sin cafeína. Sirve para entrenos de tarde o si ya controlas el café aparte.',
    categoria: 'pre-entreno',
    objetivo: 'resistencia',
    etiquetas: ['sin-cafeina', 'sin-gluten'],
    dosisRecomendada: '1 cacito (17 g) con 300 ml de agua, 30 minutos antes de entrenar.',
    tablaNutricional: {
      por100g: { energiaKcal: 118, proteinas: 0, hidratos: 18, grasas: 0, fibra: 0, sal: 0.3, cafeinaMg: 0 },
      porToma: { energiaKcal: 20, proteinas: 0, hidratos: 3, grasas: 0, fibra: 0, sal: 0.05, cafeinaMg: 0 },
    },
    variantes: [
      { sabor: 'Tropical', formato: '510 g', precio: 49.9, stock: 16 },
      { sabor: 'Sandía', formato: '510 g', precio: 49.9, stock: 11 },
    ],
  },
  {
    nombre: 'GO Hydro',
    img: '/productos/go-hydro.jpg',
    marca: 'Science in Sport',
    descripcion:
      'Electrolitos en pastillas efervescentes para reponer sodio durante esfuerzos largos. Hipotónico, sin azúcar de relleno.',
    categoria: 'hidratacion',
    objetivo: 'resistencia',
    etiquetas: ['vegano', 'sin-lactosa', 'sin-gluten', 'sin-cafeina'],
    dosisRecomendada: '1 pastilla en 500 ml de agua. En sesiones de más de 60 minutos, 1 toma por hora de esfuerzo.',
    tablaNutricional: {
      por100g: { energiaKcal: 150, proteinas: 0, hidratos: 20, grasas: 0, fibra: 0, sal: 25, sodioMg: 10000, potasioMg: 2500, magnesioMg: 500 },
      porToma: { energiaKcal: 6, proteinas: 0, hidratos: 0.8, grasas: 0, fibra: 0, sal: 1, sodioMg: 400, potasioMg: 100, magnesioMg: 20 },
    },
    variantes: [
      { sabor: 'Limón', formato: '20 pastillas', precio: 8.5, stock: 70 },
      { sabor: 'Frutos rojos', formato: '20 pastillas', precio: 8.5, stock: 42 },
      { sabor: 'Limón', formato: '80 pastillas', precio: 24.9, stock: 20 },
    ],
  },
  {
    nombre: 'Ultimate Omega',
    img: '/productos/ultimate-omega.jpg',
    marca: 'Nordic Naturals',
    descripcion:
      'Aceite de pescado concentrado en triglicéridos, con EPA y DHA. Apoya la recuperación y la salud cardiovascular entre bloques de entrenamiento.',
    categoria: 'vitaminas',
    objetivo: 'recuperacion',
    etiquetas: ['sin-lactosa', 'sin-gluten', 'sin-cafeina'],
    dosisRecomendada: '2 perlas al día, con una comida que contenga grasa.',
    tablaNutricional: {
      por100g: { energiaKcal: 900, proteinas: 0, hidratos: 0, grasas: 100, fibra: 0, sal: 0, epaMg: 18000, dhaMg: 12000 },
      porToma: { energiaKcal: 18, proteinas: 0, hidratos: 0, grasas: 2, fibra: 0, sal: 0, epaMg: 650, dhaMg: 450 },
    },
    variantes: [
      { sabor: 'Limón', formato: '60 perlas', precio: 29.9, stock: 30 },
      { sabor: 'Limón', formato: '120 perlas', precio: 49.9, stock: 18 },
    ],
  },
  {
    nombre: 'Magnesio bisglicinato',
    img: '/productos/Magnesio-bisglicinato.jpg',
    marca: 'Now Foods',
    descripcion:
      'Bisglicinato de magnesio, forma bien tolerada. 200 mg de magnesio elemental por toma para descanso, función muscular y recuperación.',
    categoria: 'vitaminas',
    objetivo: 'recuperacion',
    etiquetas: ['vegano', 'sin-lactosa', 'sin-gluten', 'sin-cafeina'],
    dosisRecomendada: '2 cápsulas al día, por la noche, con agua.',
    tablaNutricional: {
      por100g: { energiaKcal: 200, proteinas: 0, hidratos: 10, grasas: 2, fibra: 4, sal: 0, magnesioMg: 13333 },
      porToma: { energiaKcal: 3, proteinas: 0, hidratos: 0.2, grasas: 0, fibra: 0.1, sal: 0, magnesioMg: 200 },
    },
    variantes: [
      { sabor: 'Neutro', formato: '90 cápsulas', precio: 16.9, stock: 40 },
      { sabor: 'Neutro', formato: '180 cápsulas', precio: 27.9, stock: 22 },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await Product.deleteMany({});
  const insertados = await Product.insertMany(productos);
  console.log(`Seed listo: ${insertados.length} productos en ${MONGODB_URI}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Error al sembrar la base de datos', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
