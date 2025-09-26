// src/__test__/App.test.jsx
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders site title in the header", () => {
  render(<App />);
  // cible le heading (h1) contenant "MyShop"
  const heading = screen.getByRole("heading", { name: /MyShop/i });
  expect(heading).toBeInTheDocument();
});
