import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useOrders } from "../context/useOrders";
import { useApp } from "../context/useApp";
import { formatCurrency } from "../utils/currency";
import { buildCustomersFromOrders } from "../utils/customerHelpers";

import "./pages-css/Customers.css";

function Customers() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { settings } = useApp();

  const customers = useMemo(() => {
    return buildCustomersFromOrders(orders);
  }, [orders]);

  const formatDate = (date) => {
    if (!date) {
      return "No orders";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="customers-page">
      <header className="customers-header">
        <div>
          <p className="section-eyebrow">YOUR BUSINESS</p>

          <h1>Customers</h1>

          <p className="customers-subtitle">
            Keep track of the people behind your orders.
          </p>
        </div>

        <div className="customers-count">
          <strong>{customers.length}</strong>

          <span>{customers.length === 1 ? "customer" : "customers"}</span>
        </div>
      </header>

      {customers.length === 0 ? (
        <section className="customers-empty-state">
          <div className="customers-empty-icon">♙</div>

          <h2>No customers yet</h2>

          <p>
            Customers will appear here automatically when you record orders with
            customer information.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/orders/new")}
            type="button"
          >
            + Record an order
          </button>
        </section>
      ) : (
        <section className="customers-section">
          <div className="customers-section-heading">
            <div>
              <p className="section-eyebrow">CUSTOMER LIST</p>

              <h2>All customers</h2>
            </div>

            <span>{customers.length}</span>
          </div>

          <div className="customers-list">
            {customers.map((customer) => (
              <button
                className="customer-card"
                key={customer.id}
                onClick={() =>
                  navigate(`/customers/${encodeURIComponent(customer.id)}`)
                }
                type="button"
              >
                <div className="customer-card-main">
                  <div className="customer-avatar">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="customer-card-info">
                    <h3>{customer.name}</h3>

                    <p>{customer.phone || "No phone number"}</p>
                  </div>
                </div>

                <div className="customer-card-stats">
                  <div>
                    <span>Orders</span>

                    <strong>{customer.orders.length}</strong>
                  </div>

                  <div>
                    <span>Total spent</span>

                    <strong>
                      {formatCurrency(customer.totalSpent, settings.currency)}
                    </strong>
                  </div>
                </div>

                <div className="customer-card-footer">
                  <span>Last order: {formatDate(customer.lastOrderDate)}</span>

                  <p className="customer-card-footer-btn">View customer →</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default Customers;
