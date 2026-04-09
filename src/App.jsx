import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutContact from "./pages/AboutContact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStats from "./pages/AdminStats";
import Cart from "./pages/Cart";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="about-contact" element={<AboutContact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="cart" element={<Cart />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/stats"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminStats />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
