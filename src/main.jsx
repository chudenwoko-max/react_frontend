import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <App />
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: "14px",
              },
              success: {
                style: {
                  background: "#10b981",
                  color: "white",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                  color: "white",
                },
              },
            }}
          />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);