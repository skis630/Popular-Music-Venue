import {
  getByRole,
  getByText,
  render,
  screen,
} from "../../../test-utils/index";
import { Shows } from "./Shows";

test("displays relevant details for non-sold-out show", async () => {
  render(<Shows />);
  const shows = await screen.findAllByRole("listitem");
  const nonSoldOutShow = shows[0];
  const ticketsButton = getByRole(nonSoldOutShow, "button", {
    name: /tickets/i,
  });
  expect(ticketsButton).toBeInTheDocument();
});
