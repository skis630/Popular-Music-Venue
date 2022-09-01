import {render, screen} from "../../../test-utils";
import { UserProfile } from "./UserProfile";

const testUser = {
    email: "booking@avalancheofcheese.com"
}

test("greets the user", () => {
    render(<UserProfile />, {preLoadedState: { user: {userDetails: testUser}}});

    expect(screen.getByText(/hi, booking@avalancheofcheese.com/i)).toBeInTheDocument();
});

test("redirects to sign-in of user is falsy", () => {
    render(<UserProfile />);

    expect(screen.queryByText(/hi/i)).not.toBeInTheDocument();
})
