import { vi } from "vitest";
import "@testing-library/jest-dom";

beforeAll(() => {
  global.fetch = vi.fn(async (url, options = {}) => {
    // Cas App.jsx (utilise res.json())
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

    // Cas Admin.jsx (utilise res.text())
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

    return { ok: false, json: async () => ({ error: "Not Found" }) };
  });

  global.alert = vi.fn();
  global.confirm = vi.fn(() => true);
});
