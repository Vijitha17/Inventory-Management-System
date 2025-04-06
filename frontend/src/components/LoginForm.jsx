import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added
import axios from "axios";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const navigate = useNavigate(); // ✅ Added

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password },
        { withCredentials: true }
      );

      setMsg("Login Successful ✅");

      // ✅ Optional: Save token and user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Navigate based on role
      const userRole = res.data.user.role;
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "staff") {
        navigate("/staff-dashboard");
      } else {
        navigate("/home");
      }

    } catch (err) {
      console.error("Login failed:", err);
      setMsg("Login Failed ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
      <h2>Login</h2>
      <div>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        /><br/><br/>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        /><br/><br/>
        <button type="submit">Login</button><br/><br/>
        <span>{msg}</span>
      </div>
    </form>
  );
}

export default LoginForm;

