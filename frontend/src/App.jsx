/*
E-Commerce Starter (React + Tailwind)
*/

import React, { useEffect, useState } from "react";

const SAMPLE_PRODUCTS = [
  { id: 1, title: "Casual T-Shirt", price: 19.99, category: "Clothing", stock: 12, description: "Comfortable cotton t-shirt.", image: "https://picsum.photos/400/300?random=1" },
  { id: 2, title: "Running Sneakers", price: 79.99, category: "Footwear", stock: 8, description: "Lightweight running shoes.", image: "https://picsum.photos/400/300?random=2" },
  { id: 3, title: "Wireless Headphones", price: 129.99, category: "Electronics", stock: 5, description: "Noise-cancelling over-ear headphones.", image: "https://picsum.photos/400/300?random=3" },
  { id: 4, title: "Coffee Mug", price: 9.5, category: "Home", stock: 25, description: "Ceramic mug, 350ml.", image: "https://picsum.photos/400/300?random=4" },
  { id: 5, title: "Denim Jeans", price: 49.99, category: "Clothing", stock: 10, description: "Slim-fit denim jeans.", image: "https://picsum.photos/400/300?random=5" },
];

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
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [products] = useState(SAMPLE_PRODUCTS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useLocalStorage(STORAGE_KEYS.CART, []);
  const [orders, setOrders] = useLocalStorage(STORAGE_KEYS.ORDERS, []);
  const [showCheckout, setShowCheckout] = useState(false);
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))]

  const filtered = products.filter(p =>
    (category === "All" || p.category === category) &&
    (p.title.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
  );

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const found = prev.find(i => i.id === product.id);
      if (found) return prev.map(i => i.id === product.id ? { ...i, qty: Math.min(product.stock, i.qty + qty) } : i);
      return [...prev, { id: product.id, title: product.title, price: product.price, qty: Math.min(product.stock, qty) }];
    });
  }

  function updateQty(id, qty) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function clearCart() { setCart([]); }

  function proceedCheckout(customer) {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const order = { id: Date.now(), customer, items: cart, total, createdAt: new Date().toISOString() };
    setOrders(prev => [order, ...prev]);
    clearCart();
    setShowCheckout(false);
    alert("Commande enregistrée !\nID: " + order.id);
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 w-full">
      <header className="bg-white shadow w-full">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">MyShop</h1>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Rechercher..." 
              className="border rounded px-3 py-1 w-full sm:w-auto" 
            />
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="border rounded px-3 py-1 w-full sm:w-auto"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={() => setShowCheckout(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded w-full sm:w-auto transition duration-200"
            >
              Panier ({cart.reduce((s,i)=>s+i.qty,0)})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 w-full">
        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <article key={p.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                <img 
                  src={p.image} 
                  alt={p.title} 
                  className="w-full h-48 object-cover rounded-md mb-4"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x300/cccccc/969696?text=${encodeURIComponent(p.title)}`;
                  }}
                />
                <h2 className="font-semibold text-lg mb-2">{p.title}</h2>
                <p className="text-gray-600 text-sm mb-4 flex-1">{p.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-xl font-bold text-green-600">{p.price.toFixed(2)} €</div>
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
              cart.map(i => (
                <div key={i.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex-1">
                    <div className="font-medium">{i.title}</div>
                    <div className="text-sm text-gray-500">{i.price.toFixed(2)} € x {i.qty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={i.qty} 
                      min={1} 
                      onChange={(e)=>updateQty(i.id, Number(e.target.value))} 
                      className="w-16 border rounded px-2 py-1 text-sm" 
                    />
                    <button 
                      onClick={()=>removeFromCart(i.id)} 
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
                Total: {(cart.reduce((s,i)=>s+i.price*i.qty,0)).toFixed(2)} €
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={()=>setShowCheckout(true)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1 transition duration-200"
                >
                  Passer commande
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
          </div>
        </aside>
      </main>

      {/* Product detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={selected.image} 
                alt={selected.title} 
                className="w-full md:w-1/2 h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x300/cccccc/969696?text=${encodeURIComponent(selected.title)}`;
                }}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
                <p className="text-gray-600 mb-4">{selected.description}</p>
                <div className="mb-4">
                  <div className="text-xl font-semibold text-green-600">{selected.price.toFixed(2)} €</div>
                  <div className="text-sm text-gray-500">Stock: {selected.stock}</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={()=>{addToCart(selected,1); setSelected(null);}} 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Ajouter au panier
                  </button>
                  <button 
                    onClick={()=>setSelected(null)} 
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
            <h3 className="text-xl font-semibold mb-4">Passer commande</h3>
            {cart.length === 0 ? (
              <div className="text-gray-500">Votre panier est vide.</div>
            ) : (
              <CheckoutForm onCancel={()=>setShowCheckout(false)} onSubmit={proceedCheckout} />
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600 text-center">
          © MyShop - Demo
        </div>
      </footer>
    </div>
  );
}

function CheckoutForm({ onCancel, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
          onChange={e=>setName(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Adresse</label>
        <textarea 
          value={address} 
          onChange={e=>setAddress(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
          rows="3"
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