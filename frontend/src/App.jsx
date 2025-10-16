import { useState, useEffect } from "react";
import "./App.css";

function Login() {
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";
  return (
    <div className="login">
      <h1>ImpactHub — Login</h1>
      <p>Click the button below to authenticate with Google (via backend):</p>
      <a className="btn" href={`${backend}/auth/google`}>
        Login with Google
      </a>
    </div>
  );
}

function Dashboard() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {token ? (
        <div>
          <p>Received token:</p>
          <pre style={{ whiteSpace: "break-spaces" }}>{token}</pre>
        </div>
      ) : (
        <p>No token found in URL.</p>
      )}
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState("login");

  useEffect(() => {
    if (window.location.pathname === "/dashboard") setRoute("dashboard");
  }, []);

  return route === "login" ? <Login /> : <Dashboard />;
}
