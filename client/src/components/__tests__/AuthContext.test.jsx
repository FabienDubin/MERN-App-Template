import React from "react";
import { render, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProviderWrapper, AuthContext } from "@/context/auth.context";
import authService from "@/services/auth.service";

jest.mock("@/services/auth.service", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(() => Promise.resolve({ data: { name: "John Doe" } })),
  },
}));

describe("AuthContext", () => {
  const TestComponent = () => {
    const {
      isLoggedIn,
      isLoading,
      user,
      storeToken,
      authenticateUser,
      updateUser,
      logOutUser,
    } = React.useContext(AuthContext);

    React.useEffect(() => {
      storeToken("test-token");
      authenticateUser();
    }, []);

    return (
      <div>
        <p data-testid="isLoggedIn">{String(isLoggedIn)}</p>
        <p data-testid="isLoading">{String(isLoading)}</p>
        <p data-testid="user">{user ? user.name : "no-user"}</p>
        <button onClick={logOutUser} data-testid="logout">
          Log out
        </button>
        <button
          onClick={() => updateUser({ name: "Jane Doe" })}
          data-testid="update-user"
        >
          Update User
        </button>
      </div>
    );
  };

  const renderWithAuth = () =>
    render(
      <MemoryRouter>
        <AuthProviderWrapper>
          <TestComponent />
        </AuthProviderWrapper>
      </MemoryRouter>
    );

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("authenticates and sets user if token is valid", async () => {
    authService.verify.mockResolvedValueOnce({ data: { name: "John Doe" } });
    localStorage.setItem("authToken", "valid-token");

    const { getByTestId } = renderWithAuth();

    await waitFor(() => {
      expect(getByTestId("isLoggedIn").textContent).toBe("true");
      expect(getByTestId("isLoading").textContent).toBe("false");
      expect(getByTestId("user").textContent).toBe("John Doe");
    });
  });

  it("handles invalid token and logs user out", async () => {
    authService.verify.mockRejectedValueOnce(new Error("Invalid token"));
    localStorage.setItem("authToken", "invalid-token");

    const { getByTestId } = renderWithAuth();

    await waitFor(() => {
      expect(getByTestId("isLoggedIn").textContent).toBe("false");
      expect(getByTestId("isLoading").textContent).toBe("false");
      expect(getByTestId("user").textContent).toBe("no-user");
    });
  });

  it("can update the user manually", async () => {
    authService.verify.mockResolvedValueOnce({ data: { name: "John Doe" } });
    localStorage.setItem("authToken", "valid-token");

    const { getByTestId } = renderWithAuth();

    await waitFor(() => {
      expect(getByTestId("user").textContent).toBe("John Doe");
    });

    await act(async () => {
      userEvent.click(getByTestId("update-user"));
    });

    await waitFor(() => {
      expect(getByTestId("user").textContent).toBe("Jane Doe");
    });
  });

  it("removes token on logout", async () => {
    authService.verify.mockResolvedValueOnce({ data: { name: "John Doe" } });
    localStorage.setItem("authToken", "valid-token");

    const { getByTestId } = renderWithAuth();

    await waitFor(() => {
      expect(getByTestId("user").textContent).toBe("John Doe");
    });

    await act(async () => {
      userEvent.click(getByTestId("logout"));
    });

    await waitFor(() => {
      expect(getByTestId("user").textContent).toBe("no-user");
    });
    expect(localStorage.getItem("authToken")).toBe(null);
    expect(getByTestId("isLoggedIn").textContent).toBe("false");
  });
});
