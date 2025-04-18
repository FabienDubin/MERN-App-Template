import React, { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Signup from "@/pages/Signup";
import { AuthContext } from "@/context/auth.context";
import authService from "@/services/auth.service";

// ✅ Mock du composant Recaptcha
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

jest.mock("@/config/envVar.config", () => ({
  getRecaptchaKey: () => "test-site-key",
}));

jest.mock("@/services/auth.service", () => ({
  signup: jest.fn(),
}));

process.env.VITE_RECAPTCHA_SITE_KEY = "test-site-key";

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

describe("Signup component", () => {
  const renderSignup = () =>
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: null,
            storeToken: mockStoreToken,
            authenticateUser: mockAuthenticateUser,
          }}
        >
          <Signup />
        </AuthContext.Provider>
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form fields", () => {
    renderSignup();
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByTestId("confirmPassword")).toBeInTheDocument();
    expect(screen.getByTestId("firstName")).toBeInTheDocument();
    expect(screen.getByTestId("lastName")).toBeInTheDocument();
    expect(screen.getByTestId("recaptcha")).toBeInTheDocument();
  });

  it("disables submit button with invalid inputs", () => {
    renderSignup();
    const button = screen.getByRole("button", { name: /sign up/i });
    expect(button).toBeDisabled();
  });

  it("submits form and redirects on success", async () => {
    authService.signup.mockResolvedValueOnce({
      data: { user: { token: "signup-token" } },
    });

    renderSignup();

    await userEvent.type(screen.getByTestId("firstName"), "John");
    await userEvent.type(screen.getByTestId("lastName"), "Doe");
    await userEvent.type(screen.getByTestId("email"), "john@example.com");
    await userEvent.type(screen.getByTestId("password"), "Pass1234");
    await userEvent.type(screen.getByTestId("confirmPassword"), "Pass1234");

    const button = screen.getByRole("button", { name: /sign up/i });
    await waitFor(() => expect(button).not.toBeDisabled());

    await userEvent.click(button);

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Pass1234",
        recaptchaToken: "mocked-token",
      });
      expect(mockStoreToken).toHaveBeenCalledWith("signup-token");
      expect(mockAuthenticateUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message on signup failure", async () => {
    authService.signup.mockRejectedValueOnce({
      response: { data: { message: "Signup failed" } },
    });

    renderSignup();

    await userEvent.type(screen.getByTestId("firstName"), "John");
    await userEvent.type(screen.getByTestId("lastName"), "Doe");
    await userEvent.type(screen.getByTestId("email"), "john@example.com");
    await userEvent.type(screen.getByTestId("password"), "Pass1234");
    await userEvent.type(screen.getByTestId("confirmPassword"), "Pass1234");

    const button = screen.getByRole("button", { name: /sign up/i });
    await userEvent.click(button);

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
