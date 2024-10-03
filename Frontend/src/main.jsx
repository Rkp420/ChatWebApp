import React from "react";
import App from "./App.jsx";
import "./index.css";
import ReactDOM from "react-dom/client";

import { UserContextProvider } from "./context/Usercontext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ModelProvider } from "./provider/ModelProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <UserContextProvider>
    <SocketProvider>
      <ModelProvider>
        <App />
      </ModelProvider>
    </SocketProvider>
  </UserContextProvider>
);
