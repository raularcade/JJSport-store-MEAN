require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tiendagym';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({ error: error.message || 'Error interno del servidor' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API en http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB', error.message);
    process.exit(1);
  });
