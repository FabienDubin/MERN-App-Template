import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import authService from "@/services/auth.service";
import { AuthContext } from "@/context/auth.context";

beforeAll(() => {
  // Ignore specific warning messages
  jest.spyOn(console, "warn").mockImplementation((message) => {
    if (
      message.includes(
        "The width(0) and height(0) of chart should be greater than 0"
      )
    )
      return;
    console.warn(message);
  });
});

// ✅ Mock
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockStoreToken = jest.fn();
const mockAuthenticateUser = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("@/config/envVar.config", () => ({
  FALLBACK_IMG: "https://mocked-fallback.img",
  DEFAULT_PASS: "Pass123",
  API_URL: "http://localhost:5005",
  getRecaptchaKey: () => "mocked-recaptcha-key",
}));

jest.mock("@/services/auth.service", () => ({
  __esModule: true,
  default: {
    signup: jest.fn(),
    verify: jest.fn(),
  },
}));

jest.mock("react-google-recaptcha", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ onChange }) => {
      React.useEffect(() => {
        onChange("mocked-token");
      }, [onChange]);
      return <div data-testid="recaptcha">Mocked Recaptcha</div>;
    },
  };
});

// ✅ Helper pour injecter le bon AuthContext
const createMockAuthProvider = ({ user = null, isLoggedIn = false } = {}) => {
  return ({ children }) => (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading: false,
        storeToken: mockStoreToken,
        authenticateUser: mockAuthenticateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

describe("Admin flow - signup and dashboard access", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows an admin to sign up and access the dashboard", async () => {
    // ✅ Mock backend responses
    authService.signup.mockResolvedValueOnce({
      data: {
        user: {
          _id: "123",
          email: "admin@example.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          token: "mock-token",
        },
      },
    });

    authService.verify.mockResolvedValueOnce({
      data: {
        _id: "123",
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      },
    });

    const renderWithAuth = (initialRoute, provider) =>
      render(
        provider({
          children: (
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route path="*" element={<App />} />
              </Routes>
            </MemoryRouter>
          ),
        })
      );

    // ✅ Phase 1 : render signup page (user not logged in)
    const NotLoggedInProvider = createMockAuthProvider();
    renderWithAuth("/signup", NotLoggedInProvider);

    // ✅ Fill the form
    await userEvent.type(screen.getByTestId("firstName"), "Admin");
    await userEvent.type(screen.getByTestId("lastName"), "User");
    await userEvent.type(screen.getByTestId("email"), "admin@example.com");
    await userEvent.type(screen.getByTestId("password"), "Password123");
    await userEvent.type(screen.getByTestId("confirmPassword"), "Password123");

    // ✅ Submit
    const button = screen.getByRole("button", { name: /sign up/i });
    await waitFor(() => expect(button).not.toBeDisabled());
    await userEvent.click(button);

    // ✅ Check calls
    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalled();
      expect(mockStoreToken).toHaveBeenCalledWith("mock-token");
      expect(mockAuthenticateUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    // ✅ Phase 2 : simulate being logged in, go to dashboard
    const LoggedInProvider = createMockAuthProvider({
      isLoggedIn: true,
      user: {
        _id: "123",
        email: "admin@example.com",
        name: "Admin",
        role: "admin",
      },
    });

    renderWithAuth("/dashboard", LoggedInProvider);

    // ✅ Check dashboard renders
    await waitFor(() => {
      expect(screen.getByTestId("admin-dashboard-title")).toBeInTheDocument();
    });
  });
});
