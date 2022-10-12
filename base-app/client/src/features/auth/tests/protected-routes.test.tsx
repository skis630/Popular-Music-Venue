import userEvent from "@testing-library/user-event";
import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from "msw";

import { App } from "../../../App";
import { baseUrl, endpoints } from "../../../app/axios/constants";
import { handlers } from "../../../mocks/handlers";
import { server } from "../../../mocks/server";
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

const signInFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => res(ctx.status(401));

test("unsuccessful login followed by successful login", async () => {
  const errorHandler = rest.post(
    `${baseUrl}/${endpoints.signIn}`,
    signInFailure
  );
  server.resetHandlers(...handlers, errorHandler);

  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // Sign in after redirect
  const emailField = screen.getByLabelText(/email/i);
  userEvent.type(emailField, "booking@avalancheofcheese.com");

  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(passwordField, "iheartcheese");

  const authForm = screen.getByTestId("sign-in-form");
  const authButton = getByRole(authForm, "button", { name: /sign in/i });
  userEvent.click(authButton);

  server.resetHandlers();
  userEvent.click(authButton);

  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
    expect(history.entries).toHaveLength(1);
  });
});

const serverError = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => res(ctx.status(500));

test("login failure due to server error", async () => {
  const errorHandler = rest.post(`${baseUrl}/${endpoints.signIn}`, serverError);
  server.resetHandlers(...handlers, errorHandler);

  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // Sign in after redirect
  const emailField = screen.getByLabelText(/email/i);
  userEvent.type(emailField, "booking@avalancheofcheese.com");

  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(passwordField, "iheartcheese");

  const authForm = screen.getByTestId("sign-in-form");
  const authButton = getByRole(authForm, "button", { name: /sign in/i });
  userEvent.click(authButton);

  //   behavioral assertion
  const heading = await screen.findByRole("heading", { name: /sign in/i });
  expect(heading).toBeInTheDocument();

  //   unit test assertion
  await waitFor(() => {
    expect(history.location.pathname).toBe("/signin");
    expect(history.entries.length).toBe(1);
  });
});
