import { vi } from "vitest";
import "@testing-library/jest-dom";

beforeAll(() => {
  global.fetch = vi.fn(async (url, options = {}) => {
    console.log('[API]', options.method || 'GET', url, '->', options.body);

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

    // 🔹 Mock pour la vérification du token
    if (url.includes("/api/auth/me")) {
      if (options.headers?.Authorization?.includes("fake-user-token")) {
        return {
          ok: true,
          json: async () => ({
            user: { id: 2, name: "Souad", email: "souad@gtest.com", role: "user" }
          })
        };
      }
      if (options.headers?.Authorization?.includes("fake-admin-token")) {
        return {
          ok: true,
          json: async () => ({
            user: { id: 1, name: "Admin", email: "admin@eshop.com", role: "admin" }
          })
        };
      }
      return {
        ok: false,
        json: async () => ({ error: "Non authentifié" })
      };
    }

    // 🔹 Routes ADMIN (utilisent res.text())
    if (url === "/api/products" && !options.method) {
      return {
        ok: true,
        text: async () => JSON.stringify([
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

    if (url === "/api/orders" && !options.method) {
      return {
        ok: true,
        text: async () => JSON.stringify([
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

    if (url === "/api/products" && options.method === "POST") {
      return { 
        ok: true, 
        text: async () => JSON.stringify({ id: 2 }) 
      };
    }

    if (url.includes("/api/products/") && options.method === "DELETE") {
      return { 
        ok: true, 
        text: async () => JSON.stringify({ message: "deleted" }) 
      };
    }

    // 🔹 Routes APP (utilisent res.json())
    if (url === "http://localhost:4000/api/products" && !options.method) {
      return {
        ok: true,
        json: async () => [
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

    if (url === "http://localhost:4000/api/orders" && options.method === "POST") {
      return {
        ok: true,
        json: async () => ({ id: 99 }),
      };
    }

    // Route par défaut
    return { 
      ok: false, 
      json: async () => ({ error: "Not Found" }),
      text: async () => "Not Found"
    };
  });

  global.alert = vi.fn();
  global.confirm = vi.fn(() => true);
});