import "./Login.css";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../../context/Usercontext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const navigate = useNavigate();

  const { user, setUser, setIndividualConversations, setGroupConversations } =
    useUserContext();

  //Make sure after updating the user , User can go to the dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const logUser = {
        email: email.current.value,
        password: password.current.value,
      };
      const res = await axios.post("/api/login", logUser);
      if (res.status === 200) {
        console.log(res);
        setUser(res.data.user);
        setIndividualConversations(res.data.individualConversations);
        setGroupConversations(res.data.groupConversations);
        email.current.value = "";
        password.current.value = "";
        toast.success("User login successful");
      } else {
        toast.error("Login failed");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("An error occurred during Login");
      }
      console.error("Login error:", error);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginPageWrapper">
        <h1 className="heading">Welcome Back!</h1>
        <form className="loginForm" onSubmit={handleLogin}>
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
          <button className="submitButton" type="submit">
            Login
          </button>
          <p className="alreadyUser">
            New User ? &nbsp;<Link to="/register">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
