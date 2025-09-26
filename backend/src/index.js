const express = require('express');
const cors = require('cors');
const { init } = require('./db');
const products = require('./routes/products');
const orders = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

init();

app.use('/api/products', products);
app.use('/api/orders', orders);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log('Server listening on', PORT));
}
module.exports = app; // pour les tests
