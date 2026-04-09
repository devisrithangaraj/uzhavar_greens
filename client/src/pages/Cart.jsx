import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './Cart.module.css';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, placeOrdersFromCart } = useContext(AppContext);
  const [shippingPhone, setShippingPhone] = React.useState('');
  const [shippingAddress, setShippingAddress] = React.useState('');
  const [shippingPincode, setShippingPincode] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  const cleanPhone = shippingPhone.replace(/\D/g, "");
  const cleanPincode = shippingPincode.replace(/\D/g, "");
  const phoneValid = /^[6-9]\d{9}$/.test(cleanPhone);
  const pincodeValid = /^\d{6}$/.test(cleanPincode);
  const addressValid = shippingAddress.trim().length >= 10;
  const checkoutValid = phoneValid && pincodeValid && addressValid;

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <div className={styles.emptyCart}>
          <ShoppingBag size={64} className={styles.emptyIcon} />
          <h2>Your Cart is Empty</h2>
          <p>You have no microgreens in your cart yet.</p>
          <Link to="/products" className={styles.continueShoppingBtn}>
            Browse Our Greens <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Cart</h1>
      
      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={styles.cartItem}
              >
                <img src={item.image_url || item.image} alt={item.name} className={styles.itemImage} />
                
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>₹{item.price} / each</p>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button 
                      onClick={() => updateCartQuantity(item.id, -1)} 
                      className={styles.qtyBtn}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.id, 1)} 
                      className={styles.qtyBtn}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className={styles.itemTotal}>
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={item.price * item.quantity}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{ display: 'inline-block' }}
                      >
                        ₹{item.price * item.quantity}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className={styles.removeBtn}
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryRow}>
            <span>Total Items</span>
            <span>{totalQuantity}</span>
          </div>
          
          <div className={styles.summarySubtotal}>
            <span>Subtotal</span>
            <span>₹{grandTotal}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Delivery</span>
            <span className={styles.freeText}>Free</span>
          </div>
          
          <div className={styles.separator}></div>
          
          <div className={styles.summaryTotal}>
            <span>Grand Total</span>
            <motion.span 
              key={grandTotal}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={styles.totalAmount}
            >
              ₹{grandTotal}
            </motion.span>
          </div>

          <div className={styles.shippingCard}>
            <p className={styles.shippingTitle}>Delivery Details</p>

            <label className={styles.fieldLabel}>Phone Number (India)</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={shippingPhone}
              onChange={(e) => setShippingPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              className={styles.shippingInput}
            />
            {touched && !phoneValid && (
              <p className={styles.fieldError}>Enter a valid Indian number (starts with 6-9, 10 digits).</p>
            )}

            <label className={styles.fieldLabel}>Delivery Address</label>
            <textarea
              placeholder="House no, street, area, city"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
              className={styles.shippingInput}
              style={{ resize: 'vertical' }}
            />
            {touched && !addressValid && (
              <p className={styles.fieldError}>Address should be at least 10 characters.</p>
            )}

            <label className={styles.fieldLabel}>Pincode</label>
            <input
              type="text"
              placeholder="6-digit pincode"
              value={shippingPincode}
              onChange={(e) => setShippingPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              className={styles.shippingInput}
            />
            {touched && !pincodeValid && (
              <p className={styles.fieldError}>Enter a valid 6-digit pincode.</p>
            )}
          </div>

          <button
            className={styles.checkoutBtn}
            onClick={() => {
              setTouched(true);
              if (!checkoutValid) return;
              placeOrdersFromCart({
                shippingPhone: cleanPhone,
                shippingAddress: shippingAddress.trim(),
                shippingPincode: cleanPincode,
              });
            }}
            disabled={!checkoutValid}
          >
            Proceed to Checkout
          </button>
          
          <Link to="/products" className={styles.continueLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
