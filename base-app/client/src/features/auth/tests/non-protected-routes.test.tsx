import { App } from "../../../App";
import { render, screen } from "../../../test-utils/index";

test("homepage doesn't redirect to sign-in", () => {
  render(<App />);

  const homepageHeading = screen.getByRole("heading", /welcome/i);
  expect(homepageHeading).toBeInTheDocument();
});
