import { App } from "../../../App";
import { render } from "../../../test-utils/index";

test("confirmation page redirects to purchase page if holdId query param is missing", async () => {
  const { history } = render(<App />, {
    routeHistory: ["/confirm/0?seatCount=2"],
    // otherwise redirected to signin!
    preLoadedState: { user: { userDetails: { email: "test@test.com" } } },
  });

  expect(history.location.pathname).toBe("/tickets/0");
});
