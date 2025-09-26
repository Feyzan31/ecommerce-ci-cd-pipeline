import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders site title", () => {
  render(<App />);
  expect(screen.getByText(/MyShop/i)).toBeInTheDocument();
});
