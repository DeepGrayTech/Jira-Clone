"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import type { UserRole } from "@/lib/auth";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const COLORS = {
  background: "#ffffff",
  text: "#111827",
  textSecondary: "#4b5563",
  border: "#e5e7eb",
  buttonPrimary: "#2563eb",
  buttonPrimaryHover: "#1d4ed8",
  buttonSecondary: "#f3f4f6",
  buttonDanger: "#dc2626",
  success: "#22c55e",
  error: "#dc2626",
};

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [isLoading, setIsLoading] = useState(false);

  const registerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (registerTimerRef.current) clearTimeout(registerTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    if (isRegister) {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, role }),
        });
        const result = await response.json();
        setMessage(result.message);
        setMessageType(response.ok ? "success" : "error");

        if (response.ok) {
          registerTimerRef.current = setTimeout(() => {
            setIsRegister(false);
            setUsername("");
            setEmail(email);
            setPassword("");
            setMessage("");
          }, 2000);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Registration failed");
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Login via NextAuth credentials provider
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsLoading(false);

    if (result?.error) {
      setMessage(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
      setMessageType("error");
    } else if (result?.ok) {
      setMessage("Login successful");
      setMessageType("success");
      onLoginSuccess();
      // 登录成功后整页刷新，确保 NextAuth session 立即生效
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: COLORS.background,
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "28px",
            fontWeight: 700,
            color: COLORS.text,
            textAlign: "center",
          }}
        >
          Jira Clone
        </h1>
        <p
          style={{
            margin: "0 0 32px 0",
            fontSize: "14px",
            color: COLORS.textSecondary,
            textAlign: "center",
          }}
        >
          {isRegister ? "Create your account" : "Welcome back"}
        </p>

        {message && (
          <div
            role="alert"
            aria-live={messageType === "error" ? "assertive" : "polite"}
            style={{
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "20px",
              backgroundColor:
                messageType === "success"
                  ? "#dcfce7"
                  : messageType === "error"
                  ? "#fee2e2"
                  : "#eff6ff",
              color:
                messageType === "success"
                  ? "#166534"
                  : messageType === "error"
                  ? "#991b1b"
                  : "#1e40af",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="login-username"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-required="true"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Enter username"
                required
              />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
              aria-describedby={message && messageType === "error" ? "login-error" : undefined}
              style={{
                width: "100%",
                padding: "12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter email"
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
              style={{
                width: "100%",
                padding: "12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter password"
              required
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="login-role"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Role
              </label>
              <select
                id="login-role"
                value={role}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "USER" || value === "ADMIN") {
                    setRole(value);
                  }
                }}
                aria-label="User role"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            aria-label={isRegister ? "Register account" : "Log in"}
            style={{
              width: "100%",
              padding: "12px",
              background: COLORS.buttonPrimary,
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: 600,
              transition: "background 0.2s",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = COLORS.buttonPrimaryHover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = COLORS.buttonPrimary;
            }}
          >
            {isLoading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p
          style={{
            margin: "20px 0 0 0",
            textAlign: "center",
            fontSize: "14px",
            color: COLORS.textSecondary,
          }}
        >
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setUsername("");
            }}
            aria-label={isRegister ? "Switch to login" : "Switch to register"}
            style={{
              background: "none",
              border: "none",
              color: COLORS.buttonPrimary,
              cursor: "pointer",
              fontWeight: 600,
              marginLeft: "4px",
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>

        {!isRegister && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "#f0fdf4",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#166534",
            }}
          >
            <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Default Demo Account:</p>
            <p style={{ margin: "4px 0", fontWeight: 500 }}>Email: demo@example.com</p>
            <p style={{ margin: "4px 0", fontWeight: 500 }}>Password: demo123</p>
          </div>
        )}
      </div>
    </div>
  );
}
