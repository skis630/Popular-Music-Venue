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

test.each([
  { testName: "sign in", buttonName: /sign in/i },
  { testName: "sign up", buttonName: /sign up/i },
])("successful $testName flow", async ({ buttonName, testName }) => {
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // Sign in/sign up after redirect
  const emailField = screen.getByLabelText(/email/i);
  userEvent.type(emailField, "booking@avalancheofcheese.com");

  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(passwordField, "iheartcheese");

  const authForm = screen.getByTestId("sign-in-form");
  const authButton = getByRole(authForm, "button", { name: buttonName });
  userEvent.click(authButton);

  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
    expect(history.entries).toHaveLength(1);
  });
});
