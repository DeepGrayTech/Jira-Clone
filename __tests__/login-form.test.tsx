import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { signIn } from "next-auth/react";
import LoginForm from "../app/dashboard/components/LoginForm";

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  signIn: jest.fn(),
}));

const mockSignIn = signIn as jest.Mock;
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("LoginForm", () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render login form with default demo credentials", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByRole("heading", { name: "Jira Clone" })).toBeInTheDocument();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("demo@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("demo123");
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("should show default demo credentials hint", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByText("Default Demo Account:")).toBeInTheDocument();
    expect(screen.getByText("Email: demo@example.com")).toBeInTheDocument();
    expect(screen.getByText("Password: demo123")).toBeInTheDocument();
  });

  it("should switch to register form when clicking register link", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.queryByText("Default Demo Account:")).not.toBeInTheDocument();
  });

  it("should switch back to login form when clicking login link", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    const loginLink = screen.getByText("Login");
    fireEvent.click(loginLink);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
  });

  it("should handle successful login", async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: "/dashboard" });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "demo@example.com",
      password: "demo123",
      redirect: false,
      callbackUrl: "/dashboard",
    });

    await waitFor(() => {
      expect(screen.getByText("Login successful")).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).toHaveBeenCalled();
  });

  it("should handle failed login", async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin", status: 401, url: null });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "demo@example.com",
      password: "demo123",
      redirect: false,
      callbackUrl: "/dashboard",
    });

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it("should handle successful registration", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Registration successful" }),
    });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });

    const submitButton = screen.getByText("Register");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "USER",
      }),
    });

    await waitFor(() => {
      expect(screen.getByText("Registration successful")).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("test@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("should handle failed registration", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Email already exists" }),
    });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });

    const submitButton = screen.getByText("Register");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockFetch).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });

    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("should update email and password values", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "newpassword" } });

    expect(emailInput).toHaveValue("new@example.com");
    expect(passwordInput).toHaveValue("newpassword");
  });

  it("should update username and role in register mode", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    const usernameInput = screen.getByLabelText("Username");
    const roleSelect = screen.getByLabelText("User role");

    fireEvent.change(usernameInput, { target: { value: "adminuser" } });
    fireEvent.change(roleSelect, { target: { value: "ADMIN" } });

    expect(usernameInput).toHaveValue("adminuser");
    expect(roleSelect).toHaveValue("ADMIN");
  });

  it("should show success message with green background", async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: "/dashboard" });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveStyle({ backgroundColor: "#dcfce7" });
    });
  });

  it("should show error message with red background", async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin", status: 401, url: null });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveStyle({ backgroundColor: "#fee2e2" });
    });
  });

  it("should clear message when switching modes", async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin", status: 401, url: null });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    });

    await act(async () => {
      const registerLink = screen.getByText("Register");
      fireEvent.click(registerLink);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
