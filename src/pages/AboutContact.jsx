import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import styles from './AboutContact.module.css';
import aboutimage from  '../assets/aboutimage.jpg'

const AboutContact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className={styles.pageContainer}>
      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutGrid}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={styles.aboutTitle}>About Uzhavar Greens</h1>
            <p className={styles.aboutText}>
              Welcome to <span className={styles.highlight}>Uzhavar Greens</span>, your local source for premium, organic microgreens. 
              We believe in the power of fresh, nutrient-dense foods to transform health and elevate culinary experiences.
            </p>
            <p className={styles.aboutText}>
              Started in Chennai, our mission is to cultivate health through sustainable urban farming. We grow our greens 
              using precise environmental controls inside, ensuring 100% pesticide-free, fresh produce year-round.
            </p>
            <div className={styles.featureBox}>
              <div className={styles.featureIcon}>
                <span className={styles.featureIconText}>100%</span>
              </div>
              <div>
                <h4 className={styles.featureTitle}>Organic</h4>
                <p className={styles.featureSubtitle}>Non-GMO seeds</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={styles.imageContainer}
          >
            <img 
              src={aboutimage}
              alt="Farmers holding microgreens" 
              className={styles.aboutImage}
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.contactContainer}>
          <div className={styles.contactHeader}>
            <h2 className={styles.contactTitle}>Get in Touch</h2>
            <p className={styles.contactSubtitle}>Have questions about our produce or want to set up a recurring delivery? Drop us a line.</p>
          </div>

          <div className={styles.contactCard}>
            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <h3 className={styles.infoTitle}>Contact Information</h3>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <MapPin size={24} className={styles.infoIcon} />
                  <span>123 Green Avenue, Anna Nagar<br/>Chennai, Tamil Nadu 600040</span>
                </div>
                <div className={styles.infoItem}>
                  <Phone size={24} className={styles.infoIcon} />
                  <span>+91 98765 43210</span>
                </div>
                <div className={styles.infoItem}>
                  <Mail size={24} className={styles.infoIcon} />
                  <span>hello@uzhavargreens.com</span>
                </div>
                <div className={styles.infoItem}>
                  <Clock size={24} className={styles.infoIcon} />
                  <span>Mon-Sat: 8 AM - 6 PM<br/>Sun: Farm Visits (Appointment only)</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.formContainer}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={styles.input}
                      placeholder="Your Name"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={styles.input}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className={styles.inputGroup} style={{marginBottom: '1.5rem'}}>
                  <label className={styles.label}>Message</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className={`${styles.submitBtn} ${isSubmitted ? styles.submitBtnSuccess : styles.submitBtnDefault}`}
                >
                  {isSubmitted ? 'Message Sent!' : <><Send size={20} /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutContact;
