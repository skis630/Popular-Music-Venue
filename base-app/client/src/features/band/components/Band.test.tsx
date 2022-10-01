import { App } from "../../../App";
import { render, screen } from "../../../test-utils/index";

test("band page displays band name for correct bandId", async () => {
  render(<App />, { routeHistory: ["/bands/0"] });
  const heading = await screen.findByRole("heading", {
    name: /Avalanche of Cheese/i,
  });
  expect(heading).toBeInTheDocument();
});
