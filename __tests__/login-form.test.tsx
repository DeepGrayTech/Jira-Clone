import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginForm from "../app/dashboard/components/LoginForm";
import { login, register } from "../lib/auth";

jest.mock("../lib/auth", () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

const mockLogin = login as jest.MockedFunction<typeof login>;
const mockRegister = register as jest.MockedFunction<typeof register>;

describe("LoginForm", () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render login form with default admin credentials", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByRole("heading", { name: "Jira Clone" })).toBeInTheDocument();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("admin@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("admin123");
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("should show default admin credentials hint", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByText("Default Admin Account:")).toBeInTheDocument();
    expect(screen.getByText("Email: admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("Password: admin123")).toBeInTheDocument();
  });

  it("should switch to register form when clicking register link", () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.queryByText("Default Admin Account:")).not.toBeInTheDocument();
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
    mockLogin.mockResolvedValue({ success: true, message: "Login successful" });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "admin123");

    await waitFor(() => {
      expect(screen.getByText("Login successful")).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnLoginSuccess).toHaveBeenCalled();
  });

  it("should handle failed login", async () => {
    mockLogin.mockResolvedValue({ success: false, message: "Invalid credentials" });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "admin123");

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it("should handle successful registration", async () => {
    mockRegister.mockResolvedValue({ success: true, message: "Registration successful" });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });

    const submitButton = screen.getByText("Register");
    fireEvent.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith("testuser", "test@example.com", "password123", "USER");

    await waitFor(() => {
      expect(screen.getByText("Registration successful")).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("should handle failed registration", async () => {
    mockRegister.mockResolvedValue({ success: false, message: "Email already exists" });

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });

    const submitButton = screen.getByText("Register");
    fireEvent.click(submitButton);

    expect(mockRegister).toHaveBeenCalled();

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
    mockLogin.mockResolvedValue({ success: true, message: "Success" });

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
    mockLogin.mockResolvedValue({ success: false, message: "Error" });

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
    mockLogin.mockResolvedValue({ success: false, message: "Error" });

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
