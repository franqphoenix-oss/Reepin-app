import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./pages-css/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Login submitted:", {
      email,
      password,
    });

    // Temporary navigation until real authentication is added
    navigate("/dashboard");
  };

  return (
    <main className="login-page">
      <button
        className="back-button"
        onClick={() => navigate("/")}
        aria-label="Go back"
      >
        ←
      </button>

      <div className="login-header">
        <div className="login-logo">R</div>

        <h1>Welcome back</h1>

        <p>Log in to continue managing your business.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div className="password-label">
            <label htmlFor="password">Password</label>

            <button
              type="button"
              className="forgot-password"
              onClick={() => console.log("Forgot password clicked")}
            >
              Forgot password?
            </button>
          </div>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-submit">
          Log in
        </button>
      </form>

      <div className="login-footer">
        <p>
          Don't have an account?{" "}
          <button type="button" onClick={() => navigate("/register")}>
            Create account
          </button>
        </p>
      </div>
    </main>
  );
}

export default Login;
