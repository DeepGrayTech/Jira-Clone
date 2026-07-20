import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../app/dashboard/hooks/useAuth";
import { register, login, logout, getAuthState } from "../lib/auth";

jest.mock("../lib/auth", () => ({
  getAuthState: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
}));

describe("useAuth Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with unauthenticated state", () => {
    (getAuthState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBe(null);
    expect(getAuthState).toHaveBeenCalled();
  });

  it("should initialize with authenticated state", () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      email: "test@example.com",
      role: "ADMIN",
    };
    (getAuthState as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);
  });

  it("should handle login success", () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      email: "test@example.com",
      role: "ADMIN",
    };
    
    (getAuthState as jest.Mock)
      .mockReturnValueOnce({ isAuthenticated: false, user: null })
      .mockReturnValueOnce({ isAuthenticated: true, user: mockUser });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      result.current.handleLoginSuccess();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);
  });

  it("should handle logout", () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      email: "test@example.com",
      role: "ADMIN",
    };
    
    (getAuthState as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);

    act(() => {
      result.current.handleLogout();
    });

    expect(logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBe(null);
  });

  it("should allow manual state updates via setIsAuthenticated", () => {
    (getAuthState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.setIsAuthenticated(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should allow manual state updates via setCurrentUser", () => {
    const mockUser = {
      id: "2",
      username: "anotheruser",
      email: "another@example.com",
      role: "USER",
    };
    
    (getAuthState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.setCurrentUser(mockUser);
    });

    expect(result.current.currentUser).toEqual(mockUser);
  });

  it("should handle null user in logout", () => {
    (getAuthState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.handleLogout();
    });

    expect(logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBe(null);
  });
});