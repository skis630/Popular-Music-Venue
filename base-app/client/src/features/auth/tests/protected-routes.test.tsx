import { App } from "../../../App";
import { render, screen } from "../../../test-utils/index";

test.each([
  { routeName: "Profile", routePath: "/profile", headingMatch: /sign in/i },
])(
  "test redirect to sign-in if user is not logged in to $routeName",
  ({ routePath, headingMatch }) => {
    render(<App />, { routeHistory: [routePath] });
    const heading = screen.getByRole("heading", { name: headingMatch });
    expect(heading).toBeInTheDocument();
  }
);
