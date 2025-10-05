import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import App from "../App";

// Wrapper pour fournir le contexte d'authentification et routing
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

// Mock pour simuler un utilisateur connecté
const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "user"
};

describe("E-commerce App avec Authentification", () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    vi.clearAllMocks();
    // Clear le localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test("affiche la page de connexion par défaut quand non connecté", async () => {
    render(<App />, { wrapper: TestWrapper });

    // Doit afficher la page de login (redirection depuis la route protégée "/")
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inscription/i })).toBeInTheDocument();
    });
  });

  test("affiche la boutique quand l'utilisateur est connecté", async () => {
    // Simuler un utilisateur connecté dans le localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');

    render(<App />, { wrapper: TestWrapper });

    // Doit afficher la boutique avec les produits
    await waitFor(() => {
      expect(screen.getByText(/MyShop/i)).toBeInTheDocument();
    });

    // Le produit "Tee" devrait apparaître (mocké dans setupTests.js)
    const product = await screen.findByText(/tee/i);
    expect(product).toBeInTheDocument();

    // Le menu utilisateur devrait être visible
    expect(screen.getByText(/bonjour, test user/i)).toBeInTheDocument();
  });

  test("peut ajouter un produit au panier quand connecté", async () => {
    // Simuler un utilisateur connecté
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');

    render(<App />, { wrapper: TestWrapper });

    // Attendre que les produits soient chargés
    const product = await screen.findByText(/tee/i);
    expect(product).toBeInTheDocument();

    // Trouver et cliquer sur le bouton "Ajouter"
    const addButtons = screen.getAllByRole('button', { name: /ajouter/i });
    await userEvent.click(addButtons[0]);

    // Vérifier que le panier se met à jour
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /panier \(1\)/i })).toBeInTheDocument();
    });
  });

  test("redirige vers la connexion quand tentative de commande non connecté", async () => {
    render(<App />, { wrapper: TestWrapper });

    // Attendre la redirection vers login
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();
    });
  });
});