import { App } from "../../../App";
import { fireEvent, render, screen } from "../../../test-utils/index";

test("tickets page dislays band name for correct showId", async () => {
  render(<App />, {
    routeHistory: ["/tickets/0"],
    preLoadedState: { user: { userDetails: { email: "test@test.com" } } },
  });
  const heading = await screen.findByRole("heading", {
    name: /Avalanche of Cheese/i,
  });
  expect(heading).toBeInTheDocument();

  // more tests here
});

test("'purchase' button pushes the correct URL", async () => {
  const { history } = render(<App />, {
    routeHistory: ["/tickets/0"],
    preLoadedState: { user: { userDetails: { email: "test@test.com" } } },
  });

  const purchaseButton = await screen.findByRole("button", {
    name: /purchase/i,
  });
  fireEvent.click(purchaseButton);

  expect(history.location.pathname).toBe("/confirm/0");

  const searchRegex = expect.stringMatching(/holdId=\d+&seatCount=2/);
  expect(history.location.search).toEqual(searchRegex);
});
