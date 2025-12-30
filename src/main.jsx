import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";

const missingEnv = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
].filter((key) => !import.meta.env[key]);

const MissingEnvScreen = ({ missing }) => (
  <div style={{ padding: "40px", fontFamily: "inherit", lineHeight: 1.6 }}>
    <h1 style={{ marginBottom: "12px" }}>Missing environment variables</h1>
    <p style={{ marginBottom: "12px" }}>
      The app cannot start because required Vite env vars are missing:
    </p>
    <ul>
      {missing.map((key) => (
        <li key={key}>{key}</li>
      ))}
    </ul>
    <p style={{ marginTop: "16px" }}>
      Add them in Vercel → Project Settings → Environment Variables, then
      redeploy.
    </p>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById("root"));

if (missingEnv.length) {
  root.render(<MissingEnvScreen missing={missingEnv} />);
} else {
  root.render(
    <React.StrictMode>
      <HashRouter>
        <CurrencyProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CurrencyProvider>
      </HashRouter>
    </React.StrictMode>
  );
}
