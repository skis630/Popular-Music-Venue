import { App } from "../../../App";
import { fireEvent, render, screen } from "../../../test-utils";
import { NavBar } from "./NavBar";

test("Test history.push(/signin) on sign-in button click", () => {
  const { history } = render(<NavBar />);
  const signInButton = screen.getByRole("button", { name: /sign in/i });
  fireEvent.click(signInButton);
  expect(history.location.pathname).toBe("/signin");
});

test("Test redirect to sign-in page after user clicks on Sign-in button", () => {
  render(<App />);
  const signInButton = screen.getByRole("button", { name: /sign in/i });
  fireEvent.click(signInButton);
  const heading = screen.getByRole("heading", {
    name: /sign in to your account/i,
  });
  expect(heading).toBeInTheDocument();
});
