import React, { useMemo, useState } from "react";

const ORDER_STATUS = ["New", "Processing", "Shipped", "Completed"];

const groupOrders = (orders) => {
  const map = new Map();
  orders.forEach((order) => {
    const key = order.checkout_ref || `legacy-${order.id}`;
    if (!map.has(key)) {
      map.set(key, {
        checkoutRef: key,
        user: order.user,
        shipping_phone: order.shipping_phone,
        shipping_address: order.shipping_address,
        shipping_pincode: order.shipping_pincode,
        created_at: order.created_at,
        status: order.status,
        items: [],
      });
    }
    map.get(key).items.push(order);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const NewOrdersSection = ({ orders, onUpdateStatus, styles }) => {
  const [expanded, setExpanded] = useState({});
  const groups = useMemo(() => groupOrders(orders), [orders]);

  const updateGroupStatus = async (group, status) => {
    await Promise.all(group.items.map((item) => onUpdateStatus(item.id, status)));
  };

  return (
    <div className={styles.tableCard} style={{ marginBottom: "1.5rem" }}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Contact</th>
              <th className={styles.th}>Address</th>
              <th className={styles.th}>Placed At</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {groups.length === 0 && (
              <tr className={styles.tr}>
                <td className={styles.td} colSpan={6}>No new orders.</td>
              </tr>
            )}

            {groups.map((group) => (
              <React.Fragment key={group.checkoutRef}>
                <tr className={styles.tr}>
                  <td className={styles.td}>
                    <p className={styles.prodName}>{group.user?.name || "Customer"}</p>
                    <p className={styles.subtitle}>{group.user?.email}</p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.subtitle}>{group.shipping_phone || group.user?.phone}</p>
                    <p className={styles.subtitle}>Pin: {group.shipping_pincode}</p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.subtitle}>{group.shipping_address}</p>
                  </td>
                  <td className={styles.td}>{new Date(group.created_at).toLocaleString()}</td>
                  <td className={styles.td}>
                    <select
                      value={group.status}
                      onChange={(e) => updateGroupStatus(group, e.target.value)}
                      className={styles.input}
                      style={{ minWidth: "140px" }}
                    >
                      {ORDER_STATUS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className={`${styles.td} ${styles.thRight}`}>
                    <button className={styles.saveBtn} onClick={() => setExpanded((p) => ({ ...p, [group.checkoutRef]: !p[group.checkoutRef] }))}>
                      {expanded[group.checkoutRef] ? "Hide Orders" : "View Orders"}
                    </button>
                  </td>
                </tr>

                {expanded[group.checkoutRef] && (
                  <tr className={styles.tr}>
                    <td className={styles.td} colSpan={6}>
                      <table className={styles.table}>
                        <thead className={styles.thead}>
                          <tr>
                            <th className={styles.th}>Product</th>
                            <th className={styles.th}>Grams</th>
                            <th className={styles.th}>Amount</th>
                            <th className={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                          {group.items.map((item) => (
                            <tr key={item.id} className={styles.tr}>
                              <td className={styles.td}>{item.product?.name}</td>
                              <td className={styles.td}>{item.grams}g</td>
                              <td className={styles.td}>Rs {item.total_price}</td>
                              <td className={styles.td}>{item.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewOrdersSection;
