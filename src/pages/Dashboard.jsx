import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useOrders } from "../context/OrderContext";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/currency";

import "./pages-css/Dashboard.css";

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "How's it Going";
}

function getInitials(name) {
  if (!name?.trim()) {
    return "FP";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function Dashboard() {
  const navigate = useNavigate();

  const { orders } = useOrders();
  const { settings } = useApp();

  const [greeting, setGreeting] = useState(() =>
    getGreeting(new Date().getHours()),
  );

  const safeOrders = Array.isArray(orders) ? orders : [];

  const profileName = settings?.profile?.name || "Franq Phoenix";
  const profileInitials = getInitials(profileName);

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting(new Date().getHours()));
    };

    updateGreeting();

    const interval = setInterval(updateGreeting, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const currentDate = new Date();

  // Orders created during the current month.
  const currentMonthOrders = safeOrders.filter((order) => {
    const orderDate = new Date(order?.createdAt);

    if (Number.isNaN(orderDate.getTime())) {
      return false;
    }

    return (
      orderDate.getMonth() === currentDate.getMonth() &&
      orderDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Total value of orders created this month.
  const totalSales = currentMonthOrders.reduce(
    (sum, order) => sum + (Number(order?.total) || 0),
    0,
  );

  // Orders created during the previous month.
  const previousMonth =
    currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;

  const previousMonthYear =
    currentDate.getMonth() === 0
      ? currentDate.getFullYear() - 1
      : currentDate.getFullYear();

  const previousMonthOrders = safeOrders.filter((order) => {
    const orderDate = new Date(order?.createdAt);

    if (Number.isNaN(orderDate.getTime())) {
      return false;
    }

    return (
      orderDate.getMonth() === previousMonth &&
      orderDate.getFullYear() === previousMonthYear
    );
  });

  const previousMonthSales = previousMonthOrders.reduce(
    (sum, order) => sum + (Number(order?.total) || 0),
    0,
  );

  // Compare this month's sales with the previous month.
  const monthSalesChange =
    previousMonthSales > 0
      ? ((totalSales - previousMonthSales) / previousMonthSales) * 100
      : 0;

  const monthSalesChangeLabel =
    previousMonthSales === 0 && totalSales > 0
      ? "New"
      : (monthSalesChange >= 0 ? "+" : "") + monthSalesChange.toFixed(1) + "%";

  // Orders with an active follow-up.
  const followUpCount = safeOrders.filter(
    (order) => order?.followUp?.enabled && !order?.followUp?.completed,
  ).length;

  // Newest orders are stored first by OrderContext.
  const recentOrders = safeOrders.slice(0, 3);

  const getCustomerName = (order) => {
    if (typeof order?.customer === "string") {
      return order.customer || "Unnamed customer";
    }

    return order?.customer?.name || "Unnamed customer";
  };

  const getItemCount = (order) => {
    if (!Array.isArray(order?.items)) {
      return 0;
    }

    return order.items.reduce((total, item) => {
      const quantity = Number(item?.quantity);

      return total + (Number.isFinite(quantity) ? quantity : 0);
    }, 0);
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-greeting">{greeting} 👋</p>

          <h1>Here's your business.</h1>
        </div>

        <button
          className="dashboard-profile"
          aria-label="Open settings"
          type="button"
        >
          {profileInitials}
        </button>
      </section>

      <section className="overview-card">
        <div className="overview-heading">
          <div>
            <p>Total sales</p>

            <h2>{formatCurrency(totalSales, settings.currency)}</h2>
          </div>

          <span className="overview-icon">↗</span>
        </div>

        <div className="overview-footer">
          <span>This month</span>
          <strong>{monthSalesChangeLabel}</strong>
        </div>
      </section>

      <section className="stats-grid">
        <button
          className="stat-card"
          onClick={() => navigate("/orders")}
          type="button"
        >
          <span className="stat-icon">▣</span>

          <div>
            <strong>{safeOrders.length}</strong>
            <p>Orders</p>
          </div>
        </button>

        <button
          className="stat-card"
          onClick={() => navigate("/follow-ups")}
          type="button"
        >
          <span className="stat-icon">◷</span>

          <div>
            <strong>{followUpCount}</strong>
            <p>Follow-ups</p>
          </div>
        </button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">ACTIVITY</p>
            <h2>Recent orders</h2>
          </div>

          <button onClick={() => navigate("/orders")} type="button">
            View all
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-icon">▣</div>

            <h3>No orders yet</h3>

            <p>
              Your recent orders will appear here once you start recording them.
            </p>

            <button
              className="add-order-button"
              onClick={() => navigate("/orders/new")}
              type="button"
            >
              + Record an order
            </button>
          </div>
        ) : (
          <div className="dashboard-recent-orders">
            {recentOrders.map((order) => {
              const itemCount = getItemCount(order);

              return (
                <button
                  className="dashboard-order-card"
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  type="button"
                >
                  <div>
                    <strong>{getCustomerName(order)}</strong>

                    <p>
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="dashboard-order-right">
                    <strong>
                      {formatCurrency(order?.total, settings.currency)}
                    </strong>

                    <span>{order?.status || "New"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
