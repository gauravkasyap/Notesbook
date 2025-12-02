import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    try {
      const email = e.target.email.value;
      const password = e.target.password.value;

      login(email, password);
      navigate("/favorite");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back 👋</h2>
        <p className="auth-sub">Login to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <input name="email" type="email" placeholder="Email" required />
        <div className="pass-field">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Password"
            required
          />
          <span
            onClick={() => setShowPass(!showPass)}
            className="toggle-pass"
          >
            {showPass ? "🙈" : "👁️"}
          </span>
        </div>

        <button className="auth-btn">Login</button>

        <p className="auth-text">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
