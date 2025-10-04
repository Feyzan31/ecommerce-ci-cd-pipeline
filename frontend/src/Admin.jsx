/*
👩‍💼 Interface administrateur - VERSION CORRIGÉE ET TESTÉE
*/

import React, { useEffect, useState } from "react";

const BASE_URL = ""; // ✅ Vide = on utilise le proxy Vite

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    console.log(`[API] ${options.method || "GET"} ${url} ->`, res.status, data);
    if (!res.ok) throw new Error(data?.error || `Erreur HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, err);
    throw err;
  }
}

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    stock: "",
    description: "",
  });
  const [tab, setTab] = useState("products");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError(null);
    try {
      await Promise.all([fetchProducts(), fetchOrders()]);
    } catch (e) {
      setError("Erreur de chargement : " + e.message);
    }
  }

  async function fetchProducts() {
    const data = await apiFetch("/api/products");
    setProducts(Array.isArray(data) ? data : []);
  }

  async function fetchOrders() {
    const data = await apiFetch("/api/orders");
    setOrders(Array.isArray(data) ? data : []);
  }

  async function saveProduct(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: String(form.title || "").trim(),
        category: String(form.category || "").trim(),
        description: String(form.description || ""),
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
      };

      if (!payload.title || !payload.category || payload.price <= 0) {
        throw new Error("Champs obligatoires manquants ou invalides.");
      }

      const method = editing ? "PUT" : "POST";
      const path = editing
        ? `/api/products/${editing.id}`
        : "/api/products";

      await apiFetch(path, {
        method,
        body: JSON.stringify(payload),
      });

      await fetchProducts();
      setForm({ title: "", price: "", category: "", stock: "", description: "" });
      setEditing(null);
      alert(editing ? "✅ Produit mis à jour !" : "✅ Produit ajouté !");
    } catch (err) {
      console.error("❌ Erreur sauvegarde:", err);
      setError(err.message || "Erreur de sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      await fetchProducts();
      alert("🗑️ Produit supprimé !");
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError(err.message || "Erreur de suppression");
    }
  }

  function startEdit(product) {
    setEditing(product);
    setForm({
      title: product.title || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      stock: product.stock?.toString() || "",
      description: product.description || "",
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ title: "", price: "", category: "", stock: "", description: "" });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🧭 Tableau de bord administrateur</h1>
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded ${tab === "products" ? "bg-blue-600 text-white" : "bg-white border"}`}
            onClick={() => setTab("products")}
          >
            Produits
          </button>
          <button
            className={`px-3 py-2 rounded ${tab === "orders" ? "bg-blue-600 text-white" : "bg-white border"}`}
            onClick={() => setTab("orders")}
          >
            Commandes
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {tab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulaire produit */}
          <form onSubmit={saveProduct} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? `Modifier le produit #${editing.id}` : "Ajouter un produit"}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Titre"
                className="w-full border rounded px-3 py-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Prix"
                className="w-full border rounded px-3 py-2"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Catégorie"
                className="w-full border rounded px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                className="w-full border rounded px-3 py-2"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full border rounded px-3 py-2"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? "..." : editing ? "Mettre à jour" : "Ajouter"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>

          {/* Liste produits */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Liste des produits ({products.length})</h2>
              <button
                onClick={fetchProducts}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded"
              >
                Actualiser
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Titre</th>
                    <th className="border px-2 py-1">Prix (€)</th>
                    <th className="border px-2 py-1">Stock</th>
                    <th className="border px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="border px-2 py-1 text-center">{p.id}</td>
                      <td className="border px-2 py-1">{p.title}</td>
                      <td className="border px-2 py-1 text-right">{p.price.toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">{p.stock}</td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-red-600 hover:underline"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Liste des commandes ({orders.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Client</th>
                  <th className="border px-2 py-1">Total (€)</th>
                  <th className="border px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="border px-2 py-1 text-center">{o.id}</td>
                    <td className="border px-2 py-1">
                      {JSON.parse(o.customer).name}
                      <br />
                      <span className="text-gray-500 text-xs">
                        {JSON.parse(o.customer).email}
                      </span>
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {Number(o.total).toFixed(2)}
                    </td>
                    <td className="border px-2 py-1 text-xs">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
