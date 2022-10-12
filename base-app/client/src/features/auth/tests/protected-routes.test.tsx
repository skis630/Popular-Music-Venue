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

test("signin server error followed by successful signin", async () => {
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

  server.resetHandlers();
  userEvent.click(authButton);

  //   behavioral assertion
  const heading = await screen.findByRole("heading", { name: /joyous/i });
  expect(heading).toBeInTheDocument();

  //   unit test assertion
  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
    expect(history.entries.length).toBe(1);
  });
});

const signUpFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) =>
  res(
    ctx.status(400),
    ctx.json({ errorMessage: "Email address already in use" })
  );

test.each([
  {
    endpoint: endpoints.signIn,
    outcome: "failure",
    responseResolver: signInFailure,
    buttonNameRegex: /sign in/i,
  },
  {
    endpoint: endpoints.signIn,
    outcome: "server error",
    responseResolver: serverError,
    buttonNameRegex: /sign in/i,
  },
  {
    endpoint: endpoints.signUp,
    outcome: "failure",
    responseResolver: signUpFailure,
    buttonNameRegex: /sign up/i,
  },
  {
    endpoint: endpoints.signUp,
    outcome: "server error",
    responseResolver: serverError,
    buttonNameRegex: /sign up/i,
  },
])(
  "$outcome followed by success",
  async ({ endpoint, outcome, responseResolver, buttonNameRegex }) => {
    const requestHandler = rest.post(
      `${baseUrl}/${endpoint}`,
      responseResolver
    );
    // reset handlers to return unsuccessful response
    server.resetHandlers(...handlers, requestHandler);

    const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

    // sign-in/sign-up after redirect
    const emailField = screen.getByLabelText(/email/i);
    userEvent.type(emailField, "booking@avalancheofcheese.com");

    const passwordField = screen.getByLabelText(/password/i);
    userEvent.type(passwordField, "iheartcheese");

    const actionForm = screen.getByTestId("sign-in-form");
    const actionButton = getByRole(actionForm, "button", {
      name: buttonNameRegex,
    });
    userEvent.click(actionButton);

    server.resetHandlers();
    userEvent.click(actionButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe("/tickets/1");
      expect(history.entries.length).toBe(1);
    });
  }
);
