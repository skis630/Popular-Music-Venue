import userEvent from "@testing-library/user-event";

import { App } from "../../../App";
import { getByRole, render, screen, waitFor } from "../../../test-utils/index";

test.each([
  { route: "/profile" },
  { route: "/tickets/0" },
  { route: "/confirm/0?holdId=123&seatCount=2" },
])(
  "test redirect to sign-in if user is not logged in to $route",
  ({ route }) => {
    render(<App />, { routeHistory: [route] });
    const signInHeader = screen.getByRole("heading", { name: /sign in/i });
    expect(signInHeader).toBeInTheDocument();
  }
);

test("successful sign-in flow", async () => {
  // go to protected page
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // Sign in (after redirect)
  const emailField = screen.getByLabelText(/email/i);
  userEvent.type(emailField, "booking@avalancheofcheese.com");

  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(passwordField, "iheartcheese");

  const signInForm = screen.getByTestId("sign-in-form");
  const signInButton = getByRole(signInForm, "button", { name: /sign in/i });
  userEvent.click(signInButton);

  await waitFor(() => {
    // test redirect back to protected page
    expect(history.location.pathname).toBe("/tickets/1");
    // sign-in page removed from history
    expect(history.entries).toHaveLength(1);
  });
});

test("successful sign-up flow", async () => {
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // Sign up (after redirect)
  const emailField = screen.getByLabelText(/email/i);
  userEvent.type(emailField, "booking@avalancheofcheese.com");

  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(passwordField, "iheartcheese");

  const signUpButton = screen.getByRole("button", { name: /sign up/i });
  userEvent.click(signUpButton);

  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
    expect(history.entries).toHaveLength(1);
  });
});

test.each([{ name: /sign in/i }, { name: /sign up/i }])(
  "successful sign-in/sign-up flow",
  async ({ name }) => {
    const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

    // Sign in/sign up after redirect
    const emailField = screen.getByLabelText(/email/i);
    userEvent.type(emailField, "booking@avalancheofcheese.com");

    const passwordField = screen.getByLabelText(/password/i);
    userEvent.type(passwordField, "iheartcheese");

    const authForm = screen.getByTestId("sign-in-form");
    const authButton = getByRole(authForm, "button", { name });
    userEvent.click(authButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe("/tickets/1");
      expect(history.entries).toHaveLength(1);
    });
  }
);
