import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import styles from "./AdminStats.module.css";

const AdminStats = () => {
  const { adminStats, fetchAdminStats, user } = useContext(AppContext);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminStats();
    }
  }, [user]);

  return (
    <div className={styles.page}>
      <div className={styles.maxW}>
        <h1 className={styles.title}>Sales Statistics</h1>
        <p className={styles.subtitle}>Overall business metrics at a glance.</p>

        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.cardAccent}`}><p>Total Income</p><h3>Rs {Math.round(adminStats?.total_income ?? 0)}</h3></div>
          <div className={styles.card}><p>Total Orders</p><h3>{adminStats?.total_orders ?? 0}</h3></div>
          <div className={styles.card}><p>Today's Orders</p><h3>{adminStats?.todays_orders ?? 0}</h3></div>
          <div className={styles.card}><p>Completed Orders</p><h3>{adminStats?.completed_orders ?? 0}</h3></div>
          <div className={styles.card}><p>Total Products</p><h3>{adminStats?.total_products ?? 0}</h3></div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
