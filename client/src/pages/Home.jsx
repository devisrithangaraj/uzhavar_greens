import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, HeartPulse, Recycle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Chatbot from '../components/Chatbot';
import styles from './Home.module.css';
import bgimg from '../assets/bgimg.jpg'


const Home = () => {
  const { products, featuredFeedbacks } = useContext(AppContext);
  const featuredProducts = products.slice(0, 3);

  const benefitsList = [
    { title: "Nutrient Dense", desc: "Concentrated vitamins, minerals, and antioxidants, containing up to 40x more nutrients than their mature counterparts." },
    { title: "Supports Immunity", desc: "Rich in vital micronutrients that bolster the body's natural defense systems and promote long-term well-being." },
    { title: "Elevated Flavor Profiles", desc: "Intense, complex tastes that transform simple meals into gourmet culinary experiences." },
    { title: "Sustainable Farming", desc: "Cultivated indoors without harmful pesticides, requiring significantly less water and land to yield pristine greens." }
  ];

  const audienceList = [
    { title: "Fitness Enthusiasts", desc: "Seeking natural, potent sources of vitamins and enzymes to support recovery and performance." },
    { title: "Health-Conscious Individuals", desc: "Looking to seamlessly elevate their daily nutritional intake with minimal effort." },
    { title: "Children & Picky Eaters", desc: "A mild, textured approach to incorporating essential greens without overwhelming portions." },
    { title: "The Elderly", desc: "Easily digestible, nutrient-packed greens that support energy levels and overall vitality." }
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.backgroundWrapper}>
          <img
            src={bgimg}
            alt="Microgreens background"
            className={styles.backgroundImage}
          />
        </div>

        <div className={styles.heroContent}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroTitle}
          >
            Fresh <span className={styles.highlightText}>Microgreens</span> <br /> Delivered Daily
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={styles.heroSubtitle}
          >

          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/products" className={styles.ctaButton}>
              Shop Now <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Fresh from the Farm</h2>
          <p className={styles.sectionDesc}>Discover our most popular microgreens, organically grown and harvested at the peak of freshness.</p>
        </div>

        <div className={styles.grid}>
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className={styles.viewAllContainer}>
          <Link to="/products" className={styles.viewAllLink}>
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Premium Minimal Benefits Section */}
      <section className={styles.premiumSection}>
        <div className={styles.premiumContainer}>
          <div className={styles.premiumLayout}>

            <div className={styles.premiumColumn}>
              <div className={styles.premiumHeader}>
                <h2 className={styles.premiumTitle}>Why Microgreens</h2>
                <p className={styles.premiumSubtitle}>A concentrated foundation for a healthier lifestyle, cultivated with precision.</p>
              </div>

              <div className={styles.premiumList}>
                {benefitsList.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={styles.premiumRow}
                  >
                    <h3 className={styles.rowTitle}>{item.title}</h3>
                    <p className={styles.rowDesc}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={styles.premiumColumn}>
              <div className={styles.premiumHeader}>
                <h2 className={styles.premiumTitle}>Who Benefits</h2>
                <p className={styles.premiumSubtitle}>Tailored nutrition for every stage of life and wellness journey.</p>
              </div>

              <div className={styles.premiumList}>
                {audienceList.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={styles.premiumRow}
                  >
                    <h3 className={styles.rowTitle}>{item.title}</h3>
                    <p className={styles.rowDesc}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <p className={styles.sectionDesc}>Real feedback selected by our admin team.</p>
        </div>
        <div className={styles.grid}>
          {featuredFeedbacks.length === 0 && <p>No featured feedback yet.</p>}
          {featuredFeedbacks.map((item) => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{item.user?.name || item.user?.email || 'Customer'}</p>
              <p style={{ color: '#666', marginBottom: '0.35rem' }}>Rating: {item.rating}/5</p>
              <p>{item.message}</p>
            </div>
          ))}
        </div>
      </section>

      <Chatbot />
    </div>
  );
};

export default Home;
