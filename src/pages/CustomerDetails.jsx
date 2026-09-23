import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useOrders } from "../context/useOrders";
import { useApp } from "../context/useApp";
import { formatCurrency } from "../utils/currency";
import { buildCustomersFromOrders } from "../utils/customerHelpers";

import "./pages-css/CustomerDetails.css";

function CustomerDetails() {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const { orders } = useOrders();
  const { settings } = useApp();

  const customer = useMemo(() => {
    const decodedId = decodeURIComponent(customerId || "");

    const customers = buildCustomersFromOrders(orders);

    return (
      customers.find((existingCustomer) => existingCustomer.id === decodedId) ||
      null
    );
  }, [customerId, orders]);

  const formatDate = (date) => {
    if (!date) {
      return "No date";
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

  const getPaymentStatus = (order) => {
    if (order.paymentStatus === "Paid") {
      return "Paid";
    }

    if (order.paymentStatus === "Partial") {
      return "Partial";
    }

    return "Unpaid";
  };

  const getWhatsAppNumber = (phone) => {
    if (!phone) {
      return "";
    }

    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("234")) {
      return digits;
    }

    if (digits.startsWith("0")) {
      return `234${digits.slice(1)}`;
    }

    return digits;
  };

  if (!customer) {
    return (
      <main className="customer-details-page">
        <button
          className="customer-details-back"
          type="button"
          onClick={() => navigate("/customers")}
        >
          ← Customers
        </button>

        <section className="customer-details-empty">
          <div className="customer-details-empty-icon">?</div>

          <h1>Customer not found</h1>

          <p>
            This customer may no longer exist, or the customer information on
            the original order has changed.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("/customers")}
          >
            Back to customers
          </button>
        </section>
      </main>
    );
  }

  const whatsappNumber = getWhatsAppNumber(customer.phone);

  return (
    <main className="customer-details-page">
      <button
        className="customer-details-back"
        type="button"
        onClick={() => navigate("/customers")}
      >
        ← Customers
      </button>

      <header className="customer-details-header">
        <div className="customer-details-avatar">
          {customer.name.charAt(0).toUpperCase()}
        </div>

        <div className="customer-details-heading">
          <p className="section-eyebrow">CUSTOMER PROFILE</p>

          <h1>{customer.name}</h1>

          <p>{customer.phone || "No phone number"}</p>
        </div>
      </header>

      <section className="customer-action-grid">
        <button
          type="button"
          className="customer-action customer-action-primary"
          onClick={() => navigate("/orders/new")}
        >
          <span className="customer-action-icon">+</span>

          <span>
            <strong>New order</strong>
            <small>Record an order</small>
          </span>
        </button>

        {customer.phone && (
          <a className="customer-action" href={`tel:${customer.phone}`}>
            <span className="customer-action-icon">☎</span>

            <span>
              <strong>Call</strong>
              <small>{customer.phone}</small>
            </span>
          </a>
        )}

        {whatsappNumber && (
          <a
            className="customer-action"
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="customer-action-icon">◉</span>

            <span>
              <strong>WhatsApp</strong>
              <small>Message customer</small>
            </span>
          </a>
        )}
      </section>

      <section className="customer-summary-grid">
        <article>
          <span>Total orders</span>

          <strong>{customer.orders.length}</strong>
        </article>

        <article>
          <span>Total spent</span>

          <strong>
            {formatCurrency(customer.totalSpent, settings.currency)}
          </strong>
        </article>

        <article>
          <span>Outstanding</span>

          <strong>
            {formatCurrency(customer.outstandingBalance, settings.currency)}
          </strong>
        </article>
      </section>

      <section className="customer-history-section">
        <div className="customer-history-heading">
          <div>
            <p className="section-eyebrow">ORDER HISTORY</p>

            <h2>Recent orders</h2>
          </div>

          <span>{customer.orders.length}</span>
        </div>

        <div className="customer-history-list">
          {customer.orders.map((order) => {
            const paymentStatus = getPaymentStatus(order);

            return (
              <button
                className="customer-order-card"
                key={order.id}
                type="button"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="customer-order-top">
                  <div>
                    <strong>Order #{String(order.id).slice(-6)}</strong>

                    <span>{formatDate(order.createdAt)}</span>
                  </div>

                  <span
                    className={`customer-order-status customer-order-status--${paymentStatus.toLowerCase()}`}
                  >
                    {paymentStatus}
                  </span>
                </div>

                <div className="customer-order-bottom">
                  <span>
                    {Array.isArray(order.items)
                      ? order.items.reduce(
                          (totalQuantity, item) =>
                            totalQuantity + (Number(item?.quantity) || 0),
                          0,
                        )
                      : 0}{" "}
                    {Array.isArray(order.items) &&
                    order.items.reduce(
                      (totalQuantity, item) =>
                        totalQuantity + (Number(item?.quantity) || 0),
                      0,
                    ) === 1
                      ? "item"
                      : "items"}
                  </span>

                  <strong>
                    {formatCurrency(order.total, settings.currency)}
                  </strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default CustomerDetails;
