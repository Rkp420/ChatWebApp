import "./App.css";
import Register from "./Pages/Register/Register";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Home/Home";
import { useUserContext } from "./context/Usercontext";
import { useCallback, useEffect, useState } from "react";
import PrivateRoute from "./utils/Privateroute";
import { ModelProvider } from "./provider/ModelProvider";

function App() {
  const {
    user,
    setUser,
    setIndividualConversations,
    setGroupConversations,
    individualConversations,
    groupConversations,
  } = useUserContext();
  const [loading, setLoading] = useState(true);

  const getTokenFromCookies = useCallback(() => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }, []);

  useEffect(() => {
    if (user && individualConversations && groupConversations) {
      "User data updated:", user;
      "Individual Conversations: ", individualConversations;
      "Group Conversations: ", groupConversations;
    }
  }, [user, individualConversations, groupConversations]);

  useEffect(() => {
    const token = getTokenFromCookies();
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/api/user/${token}`);
          console.log(res);
          setUser(res.data.user);
          setIndividualConversations([...res.data.individualConversations]);
          setGroupConversations([...res.data.groupConversations]);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false); // Set loading to false once the request is completed
        }
      };
      fetchUser();
    } else {
      setLoading(false); // Set loading to false if there's no token
    }
  }, [
    getTokenFromCookies,
    setUser,
    setIndividualConversations,
    setGroupConversations,
  ]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: loading ? null : <Home />, // Render Home only if not loading
    },
    {
      path: "/dashboard",
      element: (
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      ),
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);

  axios.defaults.baseURL = "http://localhost:5050";
  axios.defaults.withCredentials = true;

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 1200,
        }}
      />
      {loading ? <div>Loading...</div> : <RouterProvider router={router} />}
    </>
  );
}

export default App;
