import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brandLink}>
              <img src={logo} alt="Uzhavar Greens logo" className={styles.logoImg} />
            </Link>
            <p className={styles.brandDesc}>
              Bringing organic, purely grown microgreens right to your doorstep. Fresh from local farms to your table, cultivating health and taste.
            </p>
          </div>

          <div>
            <h3 className={styles.title}>Quick Links</h3>
            <ul className={styles.linksList}>
              <li><Link to="/" className={styles.linkItem}>Home</Link></li>
              <li><Link to="/products" className={styles.linkItem}>Products</Link></li>
              <li><Link to="/about-contact" className={styles.linkItem}>About & Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.title}>Contact</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <MapPin className={styles.contactIcon} size={20} />
                <span className={styles.contactText}>Chennai, Tamil Nadu, India</span>
              </li>
              <li className={styles.contactItem}>
                <Phone className={styles.contactIcon} size={20} />
                <span className={styles.contactText}>+91 98765 43210</span>
              </li>
              <li className={styles.contactItem}>
                <Mail className={styles.contactIcon} size={20} />
                <span className={styles.contactText}>hello@uzhavargreens.com</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className={styles.bottomBar}>
          <p>&copy; {new Date().getFullYear()} Uzhavar Greens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
