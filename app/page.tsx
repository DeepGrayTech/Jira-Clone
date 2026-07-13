export default function Home() {
  return (
    <div
      style={{
        padding: "60px 24px",
        textAlign: "center",
        minHeight: "100vh",
        background: "#ffffff",
        color: "#111827",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          marginBottom: "16px",
          fontWeight: 700,
        }}
      >
        Jira Clone - Task Manager
      </h1>
      <p
        style={{
          fontSize: "18px",
          marginBottom: "40px",
          color: "#4b5563",
          lineHeight: "1.5",
        }}
      >
        Project is running!
      </p>
      <a
        href="/dashboard"
        style={{
          display: "inline-block",
          padding: "16px 40px",
          background: "#2563eb",
          color: "#ffffff",
          textDecoration: "none",
          borderRadius: "10px",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        Go to Dashboard
      </a>
    </div>
  );
}
