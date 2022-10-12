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

const errorResponseResolver = (statusCode: number, errorMessage: string) => {
  return (
    req: RestRequest<DefaultRequestBody, RequestParams>,
    res: ResponseComposition,
    ctx: RestContext
  ) =>
    res(
      ctx.status(statusCode),
      ctx.json({
        errorMessage,
      })
    );
};

test.each([
  {
    testName: "login failure",
    statusCode: 401,
    buttonName: /sign in/i,
    serverMessage: "Wrong username or password. please try again.",
  },
  {
    testName: "login server error",
    statusCode: 500,
    buttonName: /sign in/i,
    serverMessage: "Server error. Please try again",
  },
  {
    testName: "signup failure",
    statusCode: 400,
    buttonName: /sign up/i,
    serverMessage: "Email address already in use.",
  },
  {
    testName: "signup server error",
    statusCode: 500,
    buttonName: /sign up/i,
    serverMessage: "Server error. Please try again",
  },
])(
  "$testName followed by successful one",
  async ({ testName, statusCode, buttonName, serverMessage }) => {
    const requestHandler = rest.post(
      `${baseUrl}/${endpoints.signIn}`,
      errorResponseResolver(statusCode, serverMessage)
    );
    server.resetHandlers(...handlers, requestHandler);

    const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

    const emailField = screen.getByLabelText(/email/i);
    userEvent.type(emailField, "booking@avalancheofcheese.com");

    const passwordField = screen.getByLabelText(/password/i);
    userEvent.type(passwordField, "iheartcheese");

    const authForm = screen.getByTestId("sign-in-form");
    const authButton = getByRole(authForm, "button", { name: buttonName });
    userEvent.click(authButton);

    server.resetHandlers();
    userEvent.click(authButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe("/tickets/1");
      expect(history.entries.length).toBe(1);
    });
  }
);
