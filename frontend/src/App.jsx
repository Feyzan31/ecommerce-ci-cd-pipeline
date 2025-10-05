/*
E-Commerce Starter (React + Tailwind)
Connecté à un backend Express + SQLite
Avec système d'authentification et interface admin
*/

import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from './pages/Profile';
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./Admin";

const STORAGE_KEYS = { CART: "ecom_cart_v1", ORDERS: "ecom_orders_v1" };

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

// Composant Home (ton ancien App.jsx)
function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useLocalStorage(STORAGE_KEYS.CART, []);
  const [orders, setOrders] = useLocalStorage(STORAGE_KEYS.ORDERS, []);
  const [showCheckout, setShowCheckout] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // 🔹 Charger les produits depuis le backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:4000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        console.error("Erreur de chargement des produits :", e);
      }
    }
    fetchProducts();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()))
  );

  function addToCart(product, qty = 1) {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found)
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: Math.min(product.stock, i.qty + qty) } : i
        );
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          qty: Math.min(product.stock, qty),
        },
      ];
    });
  }

  function updateQty(id, qty) {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  // 🔹 Envoyer la commande au backend
  async function proceedCheckout(customer) {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const token = localStorage.getItem('token'); // Récupérer le token

    try {
      const res = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Ajouter le token dans le header
        },
        body: JSON.stringify({ 
          customer, 
          items: cart, 
          total
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur API");

      // Mettre à jour le state local aussi
      setOrders((prev) => [
        { 
          id: data.id, 
          customer, 
          items: cart, 
          total, 
          createdAt: new Date().toISOString(),
          userId: currentUser?.id 
        },
        ...prev,
      ]);
      
      clearCart();
      setShowCheckout(false);
      alert("✅ Commande enregistrée avec succès !\nID: " + data.id);
    } catch (e) {
      console.error("Erreur lors de l'enregistrement de la commande :", e);
      alert("❌ Impossible d'enregistrer la commande: " + e.message);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 w-full">
      <header className="bg-white shadow w-full">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">MyShop</h1>
          
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="border rounded px-3 py-1 w-full sm:w-auto"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-3 py-1 w-full sm:w-auto"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCheckout(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded w-full sm:w-auto transition duration-200"
            >
              Panier ({cart.reduce((s, i) => s + i.qty, 0)})
            </button>
          </div>

          {/* Menu utilisateur */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Lien vers l'admin si l'utilisateur est admin */}
                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Mon Profil
                </Link>
                <span className="text-sm text-gray-700">
                  Bonjour, {currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 w-full">
        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <article key={p.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                <img
                  src={p.image || `https://picsum.photos/400/300?random=${p.id}`}
                  alt={p.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="font-semibold text-lg mb-2">{p.title}</h2>
                <p className="text-gray-600 text-sm mb-4 flex-1">{p.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {p.price.toFixed(2)} €
                    </div>
                    <div className="text-xs text-gray-500">Stock: {p.stock}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition duration-200"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setSelected(p)}
                      className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1 rounded transition duration-200"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="w-full lg:w-80 bg-white rounded-lg shadow-md p-4 h-fit">
          <h3 className="font-semibold text-lg mb-4">Panier</h3>
          <div className="space-y-3">
            {cart.length === 0 ? (
              <div className="text-gray-500 text-sm">Votre panier est vide.</div>
            ) : (
              cart.map((i) => (
                <div key={i.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex-1">
                    <div className="font-medium">{i.title}</div>
                    <div className="text-sm text-gray-500">
                      {i.price.toFixed(2)} € x {i.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={i.qty}
                      min={1}
                      onChange={(e) => updateQty(i.id, Number(e.target.value))}
                      className="w-16 border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => removeFromCart(i.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="font-semibold text-lg mb-3">
                Total: {cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)} €
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      alert("Veuillez vous connecter pour passer commande");
                      navigate('/login');
                      return;
                    }
                    setShowCheckout(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1 transition duration-200"
                >
                  {currentUser ? "Passer commande" : "Se connecter pour commander"}
                </button>
                <button
                  onClick={clearCart}
                  className="border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded transition duration-200"
                >
                  Vider
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            Commandes enregistrées: {orders.length}
            {currentUser && (
              <div className="mt-2">
                Connecté en tant que: {currentUser.email}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Modal de détails produit */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={selected.image || `https://picsum.photos/400/300?random=${selected.id}`}
                alt={selected.title}
                className="w-full md:w-1/2 h-64 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
                <p className="text-gray-600 mb-4">{selected.description}</p>
                <div className="mb-4">
                  <div className="text-xl font-semibold text-green-600">
                    {selected.price.toFixed(2)} €
                  </div>
                  <div className="text-sm text-gray-500">Stock: {selected.stock}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addToCart(selected, 1);
                      setSelected(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Ajouter au panier
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded transition duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Passer commande {currentUser && `- ${currentUser.name}`}
            </h3>
            {cart.length === 0 ? (
              <div className="text-gray-500">Votre panier est vide.</div>
            ) : (
              <CheckoutForm 
                onCancel={() => setShowCheckout(false)} 
                onSubmit={proceedCheckout}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600 text-center">
          © MyShop - Connected Demo {currentUser && `| Connecté: ${currentUser.name}`}
        </div>
      </footer>
    </div>
  );
}

// CheckoutForm avec pré-remplissage pour les utilisateurs connectés
function CheckoutForm({ onCancel, onSubmit, currentUser }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [address, setAddress] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email) return alert("Veuillez renseigner nom et email.");
    onSubmit({ name, email, address });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Adresse</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows="3"
          placeholder="Adresse de livraison"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1 transition duration-200"
        >
          Confirmer la commande
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded transition duration-200"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

// Composant App principal avec routing
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}