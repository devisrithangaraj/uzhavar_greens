import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, PlusCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import NewOrdersSection from '../components/NewOrdersSection';
import CompletedOrdersSection from '../components/CompletedOrdersSection';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const {
    products,
    orders,
    feedbacks,
    addProduct,
    deleteProduct,
    fetchAdminProducts,
    fetchOrders,
    updateOrderStatus,
    fetchAdminFeedback,
    toggleFeedbackFeatured,
    user,
  } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState('new');
  const [showFeedback, setShowFeedback] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    grams: '',
    description: '',
    imageFile: null,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminProducts(productSearch);
      fetchOrders();
      fetchAdminFeedback();
    }
  }, [user, productSearch]);

  const newOrders = useMemo(() => orders.filter((o) => o.status !== 'Completed'), [orders]);
  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'Completed'), [orders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addProduct(formData);
    setIsModalOpen(false);
    setFormData({ name: '', price: '', grams: '', description: '', imageFile: null });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.maxW}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Manage products, orders, and user feedback.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className={styles.addBtn}>
            <PlusCircle size={20} />
            Add New Product
          </button>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products by name..."
            className={styles.input}
            style={{ maxWidth: '420px' }}
          />
        </div>

        <div className={styles.tableCard} style={{ marginBottom: '1.5rem' }}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Product</th>
                  <th className={styles.th}>Price</th>
                  <th className={styles.th}>Weight</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {products.map((product) => (
                  <tr key={product.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.productCell}>
                        <img src={product.image_url || product.image} alt={product.name} className={styles.prodImage} />
                        <div>
                          <p className={styles.prodName}>{product.name}</p>
                          <p className={styles.prodDesc}>{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.priceText}`}>Rs {product.price}</td>
                    <td className={`${styles.td} ${styles.weightText}`}>{product.grams}g</td>
                    <td className={styles.td}>
                      <div className={styles.actionCell}>
                        <button onClick={() => deleteProduct(product.id)} className={styles.deleteBtn} title="Delete">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <button
            className={activeOrderTab === 'new' ? styles.saveBtn : styles.cancelBtn}
            onClick={() => setActiveOrderTab('new')}
          >
            New Orders
          </button>
          <button
            className={activeOrderTab === 'completed' ? styles.saveBtn : styles.cancelBtn}
            onClick={() => setActiveOrderTab('completed')}
          >
            Completed Orders
          </button>
        </div>

        {activeOrderTab === 'new' ? (
          <NewOrdersSection orders={newOrders} onUpdateStatus={updateOrderStatus} styles={styles} />
        ) : (
          <CompletedOrdersSection orders={completedOrders} styles={styles} />
        )}

        <div className={styles.tableCard} style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 className={styles.title} style={{ fontSize: '1.25rem' }}>Feedback Management</h2>
            <button className={styles.saveBtn} onClick={() => setShowFeedback((prev) => !prev)}>
              {showFeedback ? 'Hide Feedbacks' : 'Show Feedbacks'}
            </button>
          </div>
          {showFeedback && (
            <>
              {feedbacks.length === 0 && <p className={styles.subtitle}>No feedback submitted yet.</p>}
              {feedbacks.map((feedback) => (
                <div key={feedback.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <p className={styles.prodName}>{feedback.user?.name || feedback.user?.email || 'User'}</p>
                    <p className={styles.subtitle}>Rating: {feedback.rating}/5</p>
                    <p>{feedback.message}</p>
                  </div>
                  <button
                    onClick={() => toggleFeedbackFeatured(feedback.id, !feedback.featured)}
                    className={styles.saveBtn}
                    style={{ height: 'fit-content' }}
                  >
                    {feedback.featured ? 'Unfeature' : 'Feature on Home'}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <div className={styles.modalOverlay}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.modalBackdrop}
                onClick={() => setIsModalOpen(false)}
              ></motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={styles.modalContent}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Add New Product</h2>
                  <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Product Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={styles.input} />
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Price</label>
                      <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Weight (grams)</label>
                      <input type="number" required min="0" value={formData.grams} onChange={(e) => setFormData({ ...formData, grams: e.target.value })} className={styles.input} />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })} className={styles.input} required />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Description</label>
                    <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${styles.input} ${styles.textarea}`}></textarea>
                  </div>

                  <div className={styles.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" className={styles.saveBtn}>Add Product</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
