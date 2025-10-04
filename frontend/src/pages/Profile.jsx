import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { currentUser, logout, getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer l'historique des commandes depuis le BACKEND
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const token = getToken();
        
        if (!token) {
          throw new Error('Token non trouvé');
        }

        const response = await fetch('http://localhost:4000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const ordersData = await response.json();
          console.log('Commandes récupérées:', ordersData);
          
          // Normaliser les données des commandes
          const normalizedOrders = ordersData.map(order => {
            // S'assurer que items est toujours un tableau
            let items = [];
            try {
              if (Array.isArray(order.items)) {
                items = order.items;
              } else if (typeof order.items === 'string') {
                items = JSON.parse(order.items);
              }
            } catch (e) {
              console.error('Erreur parsing items:', e);
              items = [];
            }
            
            return {
              ...order,
              items: items,
              createdAt: order.createdAt || order.created_at
            };
          });
          
          setOrders(normalizedOrders);
        } else {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        setError(error.message);
        // Fallback sur le localStorage si l'API échoue
        try {
          const localOrders = JSON.parse(localStorage.getItem('ecom_orders_v1') || '[]')
            .filter(order => order.userId === currentUser?.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(localOrders);
        } catch (localError) {
          console.error('Erreur fallback localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [currentUser, getToken]);

  // Fonction utilitaire pour calculer le total d'articles
  const getTotalItems = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.qty || 0), 0);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Non connecté</h2>
          <p>Veuillez vous connecter pour voir votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
          
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Attention:</strong> {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nom</label>
                  <p className="mt-1 text-gray-900">{currentUser.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1 text-gray-900">{currentUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">ID Utilisateur</label>
                  <p className="mt-1 text-sm text-gray-500">{currentUser.id}</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Déconnexion
              </button>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {orders.length}
                  </div>
                  <div className="text-gray-600">Commandes passées</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Historique des commandes</h2>
          
          {loading ? (
            <div className="text-center py-4">Chargement des commandes...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Aucune commande passée pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Commande #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {order.total?.toFixed(2)} €
                      </p>
                      <p className="text-sm text-gray-500">
                        {getTotalItems(order.items)} articles
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Articles :</h4>
                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.title} x{item.qty}</span>
                            <span>{((item.price || 0) * (item.qty || 0)).toFixed(2)} €</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">
                          Aucun détail d'article disponible
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}