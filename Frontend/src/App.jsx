import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import axios from "axios";

import Register from "./Pages/Register/Register";
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Home/Home";
import PrivateRoute from "./utils/Privateroute";

import { useUserContext } from "./context/Usercontext";
import { Toaster } from "react-hot-toast";

function App() {
  const {
    user,
    setUser,
    setIndividualConversations,
    setGroupConversations,
    individualConversations,
    groupConversations,
    setArchivedConversations,
    archivedConversations,
  } = useUserContext();
  
  const [loading, setLoading] = useState(true);

  const getTokenFromCookies = useCallback(() => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }, []);

  useEffect(() => {
    if (user && individualConversations && groupConversations) {
      console.log("User data updated:", user);
      console.log("Individual Conversations: ", individualConversations);
      console.log("Group Conversations: ", groupConversations);
      console.log("Archived Conversations: ", archivedConversations);
    }
  }, [user, individualConversations, groupConversations, archivedConversations]);

  useEffect(() => {
    const token = getTokenFromCookies();
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/api/v1/user/${token}`);
          console.log(res);
          setUser(res.data.user);
          setIndividualConversations([...res.data.individualConversations]);
          setGroupConversations([...res.data.groupConversations]);
          setArchivedConversations([...res.data.archivedConversations]);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
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
