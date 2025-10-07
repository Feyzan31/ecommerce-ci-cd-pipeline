import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Admin from "../Admin";

describe("Admin dashboard", () => {
  afterEach(() => vi.restoreAllMocks());

  test("affiche les produits et les commandes", async () => {
    render(<Admin />);
    expect(await screen.findByText(/Liste des produits/i)).toBeInTheDocument();
    expect(screen.getByText("Tee")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /commandes/i }));
    expect(await screen.findByText(/Liste des commandes/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  test("ajoute un produit", async () => {
    render(<Admin />);

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
    render(<Admin />);
    const deleteBtn = await screen.findByRole("button", { name: /🗑️/i });
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/supprimé/i));
    });
  });
});
