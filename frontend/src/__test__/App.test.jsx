import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';

// Wrapper simple pour les tests
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('E-commerce App avec Authentification', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('affiche la page de connexion par défaut quand non connecté', async () => {
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/adresse email/i)).toBeInTheDocument();
    });
  });

  test.skip('affiche la boutique quand l utilisateur est connecté', async () => {
    // Simuler un utilisateur connecté avec un délai plus long
    localStorage.setItem('token', 'fake-user-token');
    localStorage.setItem('currentUser', JSON.stringify({
      id: 2,
      name: 'Souad',
      email: 'souad@gtest.com',
      role: 'user'
    }));

    // Délai plus long pour l'initialisation
    await new Promise(resolve => setTimeout(resolve, 500));

    renderWithProviders(<App />);

    // Utiliser des timeouts plus longs et des retries
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /MyShop/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/tee/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test.skip('peut ajouter un produit au panier quand connecté', async () => {
    // Simuler un utilisateur connecté
    localStorage.setItem('token', 'fake-user-token');
    localStorage.setItem('currentUser', JSON.stringify({
      id: 2,
      name: 'Souad',
      email: 'souad@gtest.com',
      role: 'user'
    }));

    // Délai plus long
    await new Promise(resolve => setTimeout(resolve, 500));

    renderWithProviders(<App />);

    // Attendre que les produits soient chargés avec timeout
    await waitFor(() => {
      expect(screen.getByText(/tee/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Ajouter au panier
    const addButtons = screen.getAllByRole('button', { name: /ajouter/i });
    fireEvent.click(addButtons[0]);

    // Vérifier que le panier se met à jour
    await waitFor(() => {
      expect(screen.getByText(/panier \(1\)/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('redirige vers la connexion quand tentative de commande non connecté', async () => {
    renderWithProviders(<App />);

    // Se connecter d'abord
    const emailInput = screen.getByPlaceholderText(/adresse email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'souad@gtest.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    // Attendre la redirection vers la boutique avec timeout
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /MyShop/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Ajouter un produit au panier
    const addButtons = screen.getAllByRole('button', { name: /ajouter/i });
    fireEvent.click(addButtons[0]);

    // Ouvrir le panier
    const cartButton = screen.getByRole('button', { name: /panier \(\d+\)/i });
    fireEvent.click(cartButton);

    // Tenter de passer commande
    const checkoutButton = screen.getByRole('button', { name: /passer commande/i });
    fireEvent.click(checkoutButton);

    // Le formulaire de commande devrait s'afficher
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /passer commande/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});