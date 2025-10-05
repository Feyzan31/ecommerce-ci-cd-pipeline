import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Login from "../pages/Login";

// Composant de test pour utiliser le hook auth
const TestComponent = () => {
  const { currentUser, login } = useAuth();
  return (
    <div>
      <div data-testid="user-info">{currentUser ? `Connecté: ${currentUser.name}` : "Non connecté"}</div>
      <button onClick={() => login("test@test.com", "password")}>Simuler Login</button>
    </div>
  );
};

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe("Système d'Authentification", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("affiche le formulaire de connexion", async () => {
    render(<Login />, { wrapper: TestWrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test("gère la connexion utilisateur", async () => {
    // Mock de fetch pour simuler une connexion réussie
    global.fetch.mockImplementationOnce(async (url, options) => {
      if (url.includes('/api/auth/login') && options.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            user: { id: 1, name: "Test User", email: "test@test.com", role: "user" },
            token: "fake-jwt-token"
          })
        };
      }
      return { ok: false };
    });

    render(<TestComponent />, { wrapper: TestWrapper });

    // Initialement non connecté
    expect(screen.getByTestId('user-info')).toHaveTextContent('Non connecté');

    // Simuler la connexion
    const loginButton = screen.getByRole('button', { name: /simuler login/i });
    await userEvent.click(loginButton);

    // Vérifier la mise à jour de l'état
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Connecté: Test User');
    });
  });
});