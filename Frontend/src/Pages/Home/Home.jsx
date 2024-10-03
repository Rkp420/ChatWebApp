import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { useUserContext } from "../../context/Usercontext";

function Home() {
  const { user } = useUserContext();
  return (
    <>
      <div className="homepage">
        <div className="title">Welcome to my Chat app</div>
        {user ? (
          <div className="logininfo">
            <p>You are already login Press to continue</p>
            <div className="buttons">
              <Link to="/dashboard">
                <button className="btn">Go to dashboard</button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="logininfo">
            <p>Please Login or Sign up to Continue</p>
            <div className="buttons">
              <Link to="/login">
                <button className="btn">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn">SignUp</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
