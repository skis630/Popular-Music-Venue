import {
    fireEvent,
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
  const bandName = getByRole(nonSoldOutShow, "heading", { name: /avalanche of cheese/i });
  expect(bandName).toBeInTheDocument();
  const bandDescription = getByText(nonSoldOutShow, "rollicking country with ambitious kazoo solos");
  expect(bandDescription).toBeInTheDocument()
});

test("displays relevant details for sold out show", async () => {
    render(<Shows />);
    const shows = await screen.findAllByRole("listitem");
    const soldOutShow = shows[1];
    const soldOutMsg = getByRole(soldOutShow, "heading", {
        name: /sold out/i,
    });
    expect(soldOutMsg).toBeInTheDocument();
    const bandName = getByRole(soldOutShow, "heading", { name: /The Joyous Nun Riot/i });
    expect(bandName).toBeInTheDocument();
    const bandDescription = getByText(soldOutShow, "serious world music with an iconic musical saw");
    expect(bandDescription).toBeInTheDocument();
});

test("redirects to correct tickets URL when 'tickets' is clicked", async () => {
    const { history } = render(<Shows />);

    const ticketsButton = await screen.findByRole("button", { name: /tickets/i });
    fireEvent.click(ticketsButton);

    expect(history.location.pathname).toBe("/tickets/0");
})