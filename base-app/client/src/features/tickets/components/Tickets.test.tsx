import { App } from "../../../App";
import { render, screen } from "../../../test-utils/index";

test("tickets page dislays band name for correct showId", async () => {
  render(<App />, {
    routeHistory: ["/tickets/0"],
    preLoadedState: { user: { userDetails: { email: "test@test.com" } } },
  });
  const heading = await screen.findByRole("heading", {
    name: /Avalanche of Cheese/i,
  });
  expect(heading).toBeInTheDocument();
});
