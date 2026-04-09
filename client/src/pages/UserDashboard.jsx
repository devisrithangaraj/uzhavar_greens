import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle, MessageSquare, MessageSquarePlus, Trash2, Truck, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import styles from './UserDashboard.module.css';

const statusClass = (status) => {
  if (status === 'Completed') return styles.statusDelivered;
  return styles.statusTransit;
};

const UserDashboard = () => {
  const { user, myOrders, fetchMyOrders, submitFeedback, deleteMyFeedback } = useContext(AppContext);
  const [showCompleted, setShowCompleted] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, orderId: null });
  const [viewFeedback, setViewFeedback] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (user?.role === 'user') {
      fetchMyOrders();
    }
  }, [user]);

  const currentOrders = useMemo(() => myOrders.filter((order) => order.status !== 'Completed'), [myOrders]);
  const deliveredOrders = useMemo(() => myOrders.filter((order) => order.status === 'Completed'), [myOrders]);

  const openFeedbackModal = (orderId) => {
    setFeedbackModal({ open: true, orderId });
    setFeedbackMessage('');
    setRating(5);
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ open: false, orderId: null });
  };

  const openViewFeedback = (feedback) => {
    setViewFeedback(feedback);
  };

  const closeViewFeedback = () => {
    setViewFeedback(null);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim() || !feedbackModal.orderId) return;
    await submitFeedback({
      orderId: feedbackModal.orderId,
      message: feedbackMessage.trim(),
      rating,
    });
    closeFeedbackModal();
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.maxW}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>Track current orders and delivered orders with feedback support.</p>
        </div>

        <div className={styles.grid} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Truck size={24} style={{ color: 'var(--color-accent-600)' }} />
              <h2 className={styles.cardTitle}>Current Orders</h2>
            </div>
            <div className={styles.orderList}>
              {currentOrders.length === 0 && <p className={styles.emptyState}>No current orders.</p>}
              {currentOrders.map((order) => (
                <div key={order.id} className={styles.orderItemCompact}>
                  <div className={styles.orderMain}>
                    <p className={styles.orderId}>{order.product_name}</p>
                    <p className={styles.orderMeta}>{new Date(order.created_at).toLocaleString()}</p>
                    <p className={styles.orderMeta}>{order.grams}g | Rs {order.total_price}</p>
                    <p className={styles.orderMeta}>Phone: {order.shipping_phone}</p>
                    <p className={styles.orderMeta}>Address: {order.shipping_address}, {order.shipping_pincode}</p>
                  </div>
                  <p className={`${styles.orderStatus} ${statusClass(order.status)}`}>{order.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <CheckCircle size={24} style={{ color: 'var(--color-accent-600)' }} />
              <h2 className={styles.cardTitle}>Delivered Orders</h2>
              <button className={styles.toggleBtn} onClick={() => setShowCompleted((prev) => !prev)}>
                {showCompleted ? 'Hide Completed Orders' : 'Show Completed Orders'}
              </button>
            </div>

            {showCompleted && (
              <div className={styles.orderList}>
                {deliveredOrders.length === 0 && <p className={styles.emptyState}>No delivered orders yet.</p>}
                {deliveredOrders.map((order) => (
                  <div key={order.id} className={styles.orderItemCompact}>
                    <div className={styles.orderMain}>
                      <p className={styles.orderId}>{order.product_name}</p>
                      <p className={styles.orderMeta}>{new Date(order.created_at).toLocaleString()}</p>
                      <p className={styles.orderMeta}>{order.grams}g | Rs {order.total_price}</p>
                      <p className={`${styles.orderStatus} ${styles.statusDelivered}`}></p>
                      {order.feedback && (
                        <p className={styles.orderMeta}> </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {order.feedback ? (
                        <>
                          <button
                            className={styles.iconBtn}
                            title="View Review"
                            onClick={() => openViewFeedback(order.feedback)}
                          >
                            <MessageSquare size={20} />
                          </button>
                          <button
                            className={styles.iconBtn}
                            title="Delete Review"
                            onClick={() => deleteMyFeedback(order.feedback.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          className={styles.iconBtn}
                          title="Add Feedback"
                          onClick={() => openFeedbackModal(order.id)}
                        >
                          <MessageSquarePlus size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {feedbackModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBackdrop} onClick={closeFeedbackModal}></div>
          <div className={styles.modalCard}>
            <div className={styles.modalHeaderRow}>
              <h3 className={styles.cardTitle}>Submit Feedback</h3>
              <button className={styles.iconBtn} onClick={closeFeedbackModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className={styles.modalForm}>
              <textarea
                rows={4}
                placeholder="Write your feedback"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className={styles.modalInput}
              />
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className={styles.modalInput}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Bad</option>
              </select>
              <button type="submit" className={styles.checkoutBtn}>Submit</button>
            </form>
          </div>
        </div>
      )}

      {viewFeedback && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBackdrop} onClick={closeViewFeedback}></div>
          <div className={styles.modalCard}>
            <div className={styles.modalHeaderRow}>
              <h3 className={styles.cardTitle}>Your Review</h3>
              <button className={styles.iconBtn} onClick={closeViewFeedback}><X size={18} /></button>
            </div>
            <p className={styles.orderMeta}>Rating: {viewFeedback.rating}/5</p>
            <p className={styles.orderMeta}>{viewFeedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
