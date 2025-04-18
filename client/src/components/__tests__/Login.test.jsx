import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";

// Mocks
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

import Login from "@/pages/Login";
import { AuthContext } from "@/context/auth.context";
import authService from "@/services/auth.service";

// Mock of the auth service
jest.mock("@/services/auth.service", () => ({
  login: jest.fn(),
}));

describe("Login component", () => {
  const mockStoreToken = jest.fn();
  const mockAuthenticateUser = jest.fn();

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: null,
            storeToken: mockStoreToken,
            authenticateUser: mockAuthenticateUser,
          }}
        >
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits the form and redirects on successful login", async () => {
    authService.login.mockResolvedValueOnce({
      data: { authToken: "test-token" },
    });

    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText("Your Email"),
      "test@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Your super secret password"),
      "Password123"
    );
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      // console.log(authService.login.mock.calls);
      expect(authService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123",
      });
      expect(mockStoreToken).toHaveBeenCalledWith("test-token");
      expect(mockAuthenticateUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error message when login fails", async () => {
    authService.login.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid credentials" },
      },
    });

    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText("Your Email"),
      "wrong@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Your super secret password"),
      "wrongpass"
    );
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    const alert = await screen.findByText(/invalid credentials/i);
    expect(alert).toBeInTheDocument();
  });
});
