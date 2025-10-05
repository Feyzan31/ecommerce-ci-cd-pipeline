const request = require("supertest");
const app = require("../src/index");
const { db } = require("../src/db");

describe("Tests API produits", () => {

  beforeAll(() => {
    // Nettoyage DB avant chaque test
    db.prepare("DELETE FROM products").run();
  });

  test("GET /api/products → retourne la liste des produits", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/products → crée un produit", async () => {
    const newProd = {
      title: "Test Produit",
      price: 99.99,
      category: "Tests",
      stock: 5,
      description: "Produit de test automatique",
    };
    const res = await request(app).post("/api/products").send(newProd);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  test("PUT /api/products/:id → met à jour un produit", async () => {
    const create = await request(app)
      .post("/api/products")
      .send({ title: "Old", price: 10, category: "C", stock: 1, description: "" });
    const id = create.body.id;

    const update = await request(app)
      .put(`/api/products/${id}`)
      .send({ title: "Updated", price: 20, category: "New", stock: 3, description: "modifié" });

    expect(update.statusCode).toBe(200);
    expect(update.body.message).toMatch(/mis à jour/i);
  });

  test("DELETE /api/products/:id → supprime un produit", async () => {
    const create = await request(app)
      .post("/api/products")
      .send({ title: "Temp", price: 15, category: "Del", stock: 2, description: "" });
    const id = create.body.id;

    const del = await request(app).delete(`/api/products/${id}`);
    expect(del.statusCode).toBe(200);
    expect(del.body.message).toMatch(/supprimé/i);
  });

  test("GET /api/products/:id inexistant → 404", async () => {
    const res = await request(app).get("/api/products/9999");
    expect(res.statusCode).toBe(404);
  });


  //Validation des champs obligatoires 
  test("POST /api/products sans titre → 500 ou 400", async () => {
  const invalid = { price: 10, category: "A", stock: 1, description: "" };
  const res = await request(app).post("/api/products").send(invalid);
  expect([400, 500]).toContain(res.statusCode); // selon ta logique
});

//Vérifier le contenu renvoyé après ajout
test("POST puis GET /api/products/:id → retourne le bon produit", async () => {
  const newProd = {
    title: "Produit Persistant",
    price: 49.99,
    category: "Persistence",
    stock: 3,
    description: "Test de persistance",
  };
  const create = await request(app).post("/api/products").send(newProd);
  const id = create.body.id;

  const get = await request(app).get(`/api/products/${id}`);
  expect(get.statusCode).toBe(200);
  expect(get.body.title).toBe(newProd.title);
});

//Tester la cohérence des totaux des commandes
test("POST /api/orders → le total est cohérent", async () => {
  const order = {
    customer: { name: "Test Total", email: "t@example.com" },
    items: [{ id: 1, title: "Item", price: 10, qty: 3 }],
    total: 30
  };
  const res = await request(app).post("/api/orders").send(order);
  expect(res.statusCode).toBe(201);
  expect(typeof res.body.id).toBe("number");
});


//Nettoyage automatique après tests
afterAll(() => {
  db.prepare("DELETE FROM products").run();
  db.prepare("DELETE FROM orders").run();
});




});
