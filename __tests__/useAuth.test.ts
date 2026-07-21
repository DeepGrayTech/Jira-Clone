import { renderHook, act } from "@testing-library/react";
import { useSession, signOut } from "next-auth/react";
import { useAuth } from "../app/dashboard/hooks/useAuth";

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children?: import("react").ReactNode }) => children,
}));

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

let sessionState: { data: { user: Record<string, unknown> } | null; status: SessionStatus };

const setMockSession = (user: Record<string, unknown> | null, status: SessionStatus) => {
  sessionState = { data: user ? { user } : null, status };
};

describe("useAuth Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockSession(null, "unauthenticated");
    (useSession as jest.Mock).mockImplementation(() => sessionState);
  });

  it("should initialize with unauthenticated state", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBe(null);
    expect(useSession).toHaveBeenCalled();
  });

  it("should initialize with authenticated state", () => {
    const mockUser = {
      id: "1",
      name: "testuser",
      email: "test@example.com",
      role: "ADMIN",
    };
    setMockSession(mockUser, "authenticated");

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual({
      id: "1",
      email: "test@example.com",
      name: "testuser",
      username: "testuser",
      role: "ADMIN",
    });
  });

  it("should handle login success", () => {
    const mockUser = {
      id: "1",
      name: "testuser",
      email: "test@example.com",
      role: "ADMIN",
    };

    const { result, rerender } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      result.current.handleLoginSuccess();
    });

    // NextAuth refreshes the session automatically after signIn;
    // simulate the refreshed authenticated session.
    setMockSession(mockUser, "authenticated");
    rerender();

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual({
      id: "1",
      email: "test@example.com",
      name: "testuser",
      username: "testuser",
      role: "ADMIN",
    });
  });

  it("should handle logout", () => {
    const mockUser = {
      id: "1",
      name: "testuser",
      email: "test@example.com",
      role: "ADMIN",
    };
    setMockSession(mockUser, "authenticated");

    const { result, rerender } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual({
      id: "1",
      email: "test@example.com",
      name: "testuser",
      username: "testuser",
      role: "ADMIN",
    });

    act(() => {
      result.current.handleLogout();
    });

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });

    // NextAuth clears the session after signOut; simulate the cleared session.
    setMockSession(null, "unauthenticated");
    rerender();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBe(null);
  });

  it("should allow manual state updates via setIsAuthenticated", () => {
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

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.setCurrentUser(mockUser);
    });

    expect(result.current.currentUser).toEqual(mockUser);
  });

  it("should handle null user in logout", () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.handleLogout();
    });

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBe(null);
  });
});
