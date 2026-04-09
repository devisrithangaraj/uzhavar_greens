import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { AppContext } from "../context/AppContext";
import styles from "./Navbar.module.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, isAuthenticated, cart, orders, logout, loading } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const newOrdersCount = orders.filter((o) => o.status === "New").length;

  // 🔥 NAV LINKS BASED ON ROLE
  const NavLinks = () => {
    // ✅ Guest
    if (!isAuthenticated || !user) {
      return (
        <>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/products" className={styles.navLink}>Products</Link>
          <Link to="/about-contact" className={styles.navLink}>About & Contact</Link>
          <Link to="/login" className={styles.navLink}>Login</Link>
          <Link to="/register" className={styles.navLink}>Register</Link>
        </>
      );
    }

    // ✅ Admin
    if (user.role === "admin") {
      return (
        <>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/admin" className={styles.navLinkWithBadge}>
            <span>Admin Dashboard</span>
            {newOrdersCount > 0 && <span className={styles.smallBadge}>{newOrdersCount}</span>}
          </Link>
          <Link to="/admin/stats" className={styles.navLink}>Sales Stats</Link>
          <button onClick={handleLogout} className={styles.navLink}>Logout</button>
        </>
      );
    }

    // ✅ Normal User
    return (
      <>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/products" className={styles.navLink}>Products</Link>
        <Link to="/about-contact" className={styles.navLink}>About & Contact</Link>
        <Link to="/dashboard" className={styles.navLink}>My Orders</Link>
        <button onClick={handleLogout} className={styles.navLink}>Logout</button>
      </>
    );
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.navInner}>

          {/* 🔷 Logo */}
          <Link to="/" className={styles.brand}>
            <img src={logo} alt="logo" />
            <span>Uzhavar Greens</span>
          </Link>

          {/* 🔷 Desktop Menu */}
          <div className={styles.desktopMenu}>
            <NavLinks />

            {/* ✅ Cart only for normal users */}
            {isAuthenticated && user?.role !== "admin" && (
              <Link to="/cart" className={styles.cartLink}>
                <ShoppingCart size={24} />
                {cartItemsCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemsCount}</span>
                )}
              </Link>
            )}
          </div>

          {/* 🔷 Mobile Menu Button */}
          <div className={styles.mobileMenuBtnContainer}>

            {/* ✅ Cart only for normal users */}
            {isAuthenticated && user?.role !== "admin" && (
              <Link to="/cart" className={styles.cartLink}>
                <ShoppingCart size={24} />
                {cartItemsCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemsCount}</span>
                )}
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={styles.menuBtn}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 🔷 Mobile Menu */}
      {isOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNavLinks}>
            <NavLinks />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
