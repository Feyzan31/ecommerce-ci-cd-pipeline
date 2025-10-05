import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("E-commerce App", () => {
  afterEach(() => vi.restoreAllMocks());

  test("affiche les produits et ajoute au panier", async () => {
    render(<App />);

    // Le produit "Tee" devrait apparaître
    const product = await screen.findByText(/tee/i);
    expect(product).toBeInTheDocument();

    // Bouton "Ajouter"
    const addBtn = screen.getByRole("button", { name: /ajouter/i });
    await userEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /panier \(1\)/i })).toBeInTheDocument();
    });
  });

  test("passe commande (POST /api/orders)", async () => {
    render(<App />);

    const addBtn = await screen.findByRole("button", { name: /ajouter/i });
    await userEvent.click(addBtn);

    await userEvent.click(screen.getByRole("button", { name: /panier/i }));
    await userEvent.click(screen.getByRole("button", { name: /passer commande/i }));

    await userEvent.type(screen.getByLabelText(/nom/i), "Souad");
    await userEvent.type(screen.getByLabelText(/email/i), "souad@example.com");
    await userEvent.type(screen.getByLabelText(/adresse/i), "Rabat");

    await userEvent.click(screen.getByRole("button", { name: /confirmer/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/succès/i));
    });
  });
});
