import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    let valid = true;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!trimmedEmail) {
      setEmailError("Please enter your email");
      valid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
  
    if (!trimmedPassword) {
      setPasswordError("Please enter your password");
      valid = false;
    } else {
      setPasswordError("");
    }
  
    if (valid) {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include", // for cookies if backend sends them
          body: JSON.stringify({
            email: trimmedEmail,
            password: trimmedPassword
          })
        });
  
        const data = await response.json();
        console.log("Response from server:", data);
  
        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }
  
        // Store token if needed
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          navigate("/home");
        } else {
          throw new Error("Invalid login response: token not found");
        }

        
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome Back</h2>
        <p className="sub-heading">Login to your account</p>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <p className="error-message">{emailError}</p>}

        <input
          type={showPassword ? "text" : "password"} // 👈 Show/hide password here
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p
          className="toggle-password" // 👈 Style this in CSS
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </p>
        {passwordError && <p className="error-message">{passwordError}</p>}

        <p
          className="forgot-password"
          onClick={() => alert("Forgot Password feature coming soon!")}
        >
          Forgot Password?
        </p>

        <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
            {loading && <div className="spinner"></div>}

        </button>

      </div>
    </div>
  );
}

export default Login;
