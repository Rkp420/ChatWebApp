import { useEffect, useRef } from "react";
import "./Register.css";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const cnfPassword = useRef();
  const navigate = useNavigate();

  const handleRegistration = (e) => {
    e.preventDefault();
    const registerNewUser = async () => {
      try {
        if (password.current.value !== cnfPassword.current.value) {
          toast.error("Password and Confirm Password must be the same");
          password.current.value = "";
          cnfPassword.current.value = "";
        } else {
          const newUser = {
            username: username.current.value,
            email: email.current.value,
            password: password.current.value,
          };
          // Ensure URL matches server-side route
          const res = await axios.post("/api/register", newUser);
          if (res.status === 201) {
            email.current.value = "";
            username.current.value = "";
            password.current.value = "";
            cnfPassword.current.value = "";
            toast.success("User registration successful");
            navigate('/login');
          } else {
            toast.error("Registration failed");
          }
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.msg) {
          toast.error(error.response.data.msg);
        } else {
          toast.error("An error occurred during registration");
        }
        console.error("Registration error:", error);
      }
    };
    registerNewUser();
  };

  return (
    <div className="registerPage">
      <div className="registerPageWrapper">
        <h1 className="heading">New Registration</h1>
        <form className="registerForm" onSubmit={handleRegistration}>
          <input
            className="inputField"
            type="text"
            placeholder="Username"
            ref={username}
            required
          />
          <input
            className="inputField"
            type="email"
            placeholder="Email"
            ref={email}
            required
          />
          <input
            className="inputField"
            type="password"
            placeholder="Password"
            ref={password}
            required
          />
          <input
            className="inputField"
            type="password"
            placeholder="Confirm Password"
            ref={cnfPassword}
            required
          />
          <button className="submitButton" type="submit">
            Register
          </button>
          <p className="alreadyUser">
            Already a User ? &nbsp;<Link to="/login">Login Now</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
