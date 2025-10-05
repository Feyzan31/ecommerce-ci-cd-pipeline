import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Admin from "../Admin";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Wrapper pour Admin avec AuthProvider
const renderAdmin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Admin />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Admin dashboard", () => {
  beforeEach(() => {
    // Reset avant chaque test
    localStorage.clear();
    vi.clearAllMocks();
    
    // Simuler un admin connecté
    localStorage.setItem('token', 'fake-admin-token');
    localStorage.setItem('currentUser', JSON.stringify({
      id: 1,
      name: 'Admin',
      email: 'admin@eshop.com',
      role: 'admin'
    }));
  });

  afterEach(() => vi.restoreAllMocks());

  test("affiche les produits et les commandes", async () => {
    // Petit délai pour l'initialisation de l'authentification
    await new Promise(resolve => setTimeout(resolve, 100));
    
    renderAdmin();
    
    expect(await screen.findByText(/Liste des produits/i)).toBeInTheDocument();
    expect(await screen.findByText("Tee")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /commandes/i }));
    expect(await screen.findByText(/Liste des commandes/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  test("ajoute un produit", async () => {
    // Petit délai pour l'initialisation de l'authentification
    await new Promise(resolve => setTimeout(resolve, 100));
    
    renderAdmin();

    // Attendre que le composant soit chargé
    await screen.findByText(/Liste des produits/i);

    // remplir formulaire
    await userEvent.type(screen.getByPlaceholderText("Titre"), "Nouveau produit");
    await userEvent.type(screen.getByPlaceholderText("Prix"), "12.50");
    await userEvent.type(screen.getByPlaceholderText("Catégorie"), "Test");
    await userEvent.type(screen.getByPlaceholderText("Stock"), "8");
    await userEvent.type(screen.getByPlaceholderText("Description"), "Produit de test");

    await userEvent.click(screen.getByRole("button", { name: /ajouter/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/ajouté/i));
    });
  });

  test("supprime un produit", async () => {
    // Petit délai pour l'initialisation de l'authentification
    await new Promise(resolve => setTimeout(resolve, 100));
    
    renderAdmin();
    
    // Attendre que les produits soient chargés
    await screen.findByText("Tee");
    
    const deleteBtn = await screen.findByRole("button", { name: /🗑️/i });
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/supprimé/i));
    });
  });
});