import { vi } from "vitest";
import "@testing-library/jest-dom";

beforeAll(() => {
  global.fetch = vi.fn(async (url, options = {}) => {
    // 🔹 Mocks pour l'authentification
    if (url.includes("/api/auth/login") && options.method === "POST") {
      const body = JSON.parse(options.body);
      if (body.email === "admin@eshop.com" && body.password === "admin123") {
        return {
          ok: true,
          json: async () => ({
            success: true,
            user: { id: 1, name: "Admin", email: "admin@eshop.com", role: "admin" },
            token: "fake-admin-token"
          })
        };
      }
      if (body.email === "souad@gtest.com" && body.password === "password") {
        return {
          ok: true,
          json: async () => ({
            success: true,
            user: { id: 2, name: "Souad", email: "souad@gtest.com", role: "user" },
            token: "fake-user-token"
          })
        };
      }
      return {
        ok: false,
        json: async () => ({ success: false, error: "Identifiants incorrects" })
      };
    }

    if (url.includes("/api/auth/register") && options.method === "POST") {
      return {
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 3, name: "Nouveau User", email: "new@user.com", role: "user" },
          token: "fake-new-user-token"
        })
      };
    }

    // 🔹 Cas App.jsx (utilise res.json())
    if (url.includes("http://localhost:4000/api/products") && !options.method) {
      return {
        ok: true,
        json: async () =>
          [
            {
              id: 1,
              title: "Tee",
              price: 10,
              category: "Clothes",
              stock: 5,
              description: "x",
            },
          ],
      };
    }

    if (url.includes("http://localhost:4000/api/orders") && options.method === "POST") {
      return {
        ok: true,
        json: async () => ({ id: 99 }),
      };
    }

    // 🔹 Cas Admin.jsx (utilise res.text())
    if (url.endsWith("/api/products") && !url.startsWith("http")) {
      return {
        ok: true,
        text: async () =>
          JSON.stringify([
            {
              id: 1,
              title: "Tee",
              price: 10,
              category: "Clothes",
              stock: 5,
              description: "x",
            },
          ]),
      };
    }

    if (url.endsWith("/api/orders") && !url.startsWith("http")) {
      return {
        ok: true,
        text: async () =>
          JSON.stringify([
            {
              id: 1,
              customer: JSON.stringify({ name: "Alice", email: "a@a.com" }),
              items: "[]",
              total: 10,
              createdAt: new Date().toISOString(),
            },
          ]),
      };
    }

    if (url.includes("/api/products") && options.method === "POST") {
      return { ok: true, text: async () => JSON.stringify({ id: 2 }) };
    }

    if (url.includes("/api/products/") && options.method === "DELETE") {
      return { ok: true, text: async () => JSON.stringify({ message: "deleted" }) };
    }

    // Mock pour les routes protégées avec token
    if (options.headers && options.headers.Authorization) {
      // Simuler une vérification de token valide
      if (options.headers.Authorization.includes("fake-admin-token")) {
        // Admin routes - à compléter si nécessaire
      } else if (options.headers.Authorization.includes("fake-user-token")) {
        // User routes - à compléter si nécessaire
      }
    }

    return { ok: false, json: async () => ({ error: "Not Found" }) };
  });

  global.alert = vi.fn();
  global.confirm = vi.fn(() => true);
});