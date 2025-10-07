const request = require('supertest');
const app = require('../src/index');
const { db } = require('../src/db');

describe('API /api/orders', () => {

  //Nettoyer la table avant chaque test
  beforeEach(() => {
    db.prepare('DELETE FROM orders').run();
  });

  // Test création valide
  it('crée une commande avec succès', async () => {
    const orderData = {
      customer: { name: 'Souad Test', email: 'souad@example.com' },
      items: [{ id: 1, title: 'Casual T-Shirt', price: 19.99, qty: 2 }],
      total: 39.98,
    };

    const res = await request(app)
      .post('/api/orders')
      .send(orderData)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  //Test création sans client
  it('retourne une erreur si les champs sont manquants', async () => {
    const invalid = { items: [], total: 10 };
    const res = await request(app).post('/api/orders').send(invalid);
    expect([400, 500]).toContain(res.statusCode);
  });

  // Test création avec total invalide
  it('refuse une commande avec total négatif', async () => {
    const badOrder = {
      customer: { name: 'Bad', email: 'bad@example.com' },
      items: [{ id: 1, title: 'X', price: 10, qty: 1 }],
      total: -5,
    };
    const res = await request(app).post('/api/orders').send(badOrder);
    expect([400, 500]).toContain(res.statusCode);
  });

  // Test récupération des commandes
  it('retourne la liste des commandes', async () => {
    // Insertion directe
    db.prepare(
      'INSERT INTO orders (customer, items, total, createdAt) VALUES (?, ?, ?, ?)'
    ).run(
      JSON.stringify({ name: 'Test Client', email: 'test@example.com' }),
      JSON.stringify([{ id: 1, title: 'Casual T-Shirt', price: 19.99, qty: 1 }]),
      19.99,
      new Date().toISOString()
    );

    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const firstOrder = res.body[0];
    expect(firstOrder).toHaveProperty('id');
    expect(firstOrder).toHaveProperty('customer');
    expect(firstOrder).toHaveProperty('items');
    expect(firstOrder).toHaveProperty('total');
  });
});
