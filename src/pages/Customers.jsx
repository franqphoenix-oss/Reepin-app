import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";

import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/currency";

import "./pages-css/Customers.css";

function Customers() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { settings } = useApp();

  const safeOrders = Array.isArray(orders) ? orders : [];

  const customers = useMemo(() => {
    const customerMap = new Map();

    safeOrders.forEach((order) => {
      if (!order || typeof order !== "object") {
        return;
      }

      const rawCustomer = order.customer;

      const name =
        typeof rawCustomer === "string"
          ? rawCustomer.trim()
          : rawCustomer?.name?.trim() || "";

      if (!name) {
        return;
      }

      const phone =
        typeof rawCustomer === "string" ? "" : rawCustomer?.phone?.trim() || "";

      /*
       * Prefer the phone number as the unique identifier.
       * If there is no phone number, fall back to the customer's name.
       */
      const key = phone || name.toLowerCase();

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name,
          phone,
          orders: [],
          totalSpent: 0,
          lastOrderDate: order.createdAt || "",
        });
      }

      const customer = customerMap.get(key);

      customer.orders.push(order);
      customer.totalSpent += Number(order.total) || 0;

      /*
       * Keep the most recent order date.
       */
      const currentOrderDate = new Date(order.createdAt);
      const lastOrderDate = new Date(customer.lastOrderDate);

      if (
        !Number.isNaN(currentOrderDate.getTime()) &&
        (Number.isNaN(lastOrderDate.getTime()) ||
          currentOrderDate > lastOrderDate)
      ) {
        customer.lastOrderDate = order.createdAt;
      }

      /*
       * If an older order had no phone number but a newer
       * order does, keep the available phone number.
       */
      if (!customer.phone && phone) {
        customer.phone = phone;
      }
    });

    return Array.from(customerMap.values())
      .map((customer) => ({
        ...customer,

        /*
         * Make the customer's newest order first.
         * This guarantees "View order" opens the latest one.
         */
        orders: [...customer.orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
      }))
      .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
  }, [safeOrders]);

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
