import React, { useContext,useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Leaf } from 'lucide-react';
import styles from './Products.module.css';

const Products = () => {
  const { products, fetchProducts } = useContext(AppContext);
  const [search, setSearch] = useState('');



   useEffect(() => {
    fetchProducts(search);
  }, [search]);

   return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.iconContainer}
          >
            <Leaf size={32} style={{color: 'var(--color-accent-600)'}} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.title}
          >
            Our Products
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.subtitle}
          >
            Fresh, organic, and locally grown microgreens. Harvested to order and delivered straight to your door.
          </motion.p>
          <div className={styles.searchWrap}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No products available at the moment.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={styles.grid}
          >
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;
