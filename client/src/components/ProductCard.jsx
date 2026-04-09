import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(AppContext);
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const totalPrice = product.price * quantity;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        <img 
          src={product.image_url || product.image} 
          alt={product.name} 
          className={styles.image}
        />
        <div className={styles.badge}>
          {product.grams}g
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        
        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <AnimatePresence mode="popLayout">
              <motion.span 
                key={totalPrice}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
                className={styles.price}
              >
                ₹{totalPrice}
              </motion.span>
            </AnimatePresence>
            {quantity > 1 && <span className={styles.unitPrice}>(₹{product.price}/ea)</span>}
          </div>
          <div className={styles.actionContainer}>
            <div className={styles.quantityControls}>
              <button onClick={handleDecrease} className={styles.qtyBtn} disabled={quantity <= 1} aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className={styles.quantity}>{quantity}</span>
              <button onClick={handleIncrease} className={styles.qtyBtn} aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
            <button 
              onClick={() => {
                addToCart(product, quantity);
                setQuantity(1); // Reset after adding
              }}
              className={styles.addBtn}
            >
              <ShoppingCart size={20} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
