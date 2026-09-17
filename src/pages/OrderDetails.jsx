import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useOrders } from "../context/OrderContext";

import "./OrderDetails.css";

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { getOrderById, updateOrder, deleteOrder } = useOrders();

  const order = getOrderById(orderId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  const [showPaymentUpdate, setShowPaymentUpdate] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const handleDelete = () => {
    deleteOrder(order.id);
    navigate("/orders");
  };

  const handleStatusChange = (newStatus) => {
    if (!order || order.status === newStatus) {
      setShowStatusOptions(false);
      return;
    }

    updateOrder(order.id, {
      status: newStatus,
    });

    setShowStatusOptions(false);
  };

  const openPaymentUpdate = () => {
    setPaymentAmount("");
    setPaymentError("");
    setShowPaymentUpdate(true);
  };

  const closePaymentUpdate = () => {
    setPaymentAmount("");
    setPaymentError("");
    setShowPaymentUpdate(false);
  };

  const handlePaymentUpdate = (event) => {
    event.preventDefault();

    const newPayment = Number(paymentAmount);
    const currentPaid = Number(order.amountPaid) || 0;
    const balance = Number(order.balance) || 0;

    if (!Number.isFinite(newPayment) || newPayment <= 0) {
      setPaymentError("Enter a valid payment amount.");
      return;
    }

    if (newPayment > balance) {
      setPaymentError(
        `Payment cannot be more than the outstanding balance of ₦${balance.toLocaleString()}.`,
      );
      return;
    }

    updateOrder(order.id, {
      amountPaid: currentPaid + newPayment,
    });

    closePaymentUpdate();
  };

  if (!order) {
    return (
      <main className="order-details-page">
        <header className="order-details-header">
          <button
            type="button"
            className="order-details-back"
            onClick={() => navigate("/orders")}
            aria-label="Back to orders"
          >
            ←
          </button>

          <div>
            <p>ORDER</p>
            <h1>Order not found</h1>
          </div>
        </header>

        <section className="order-not-found">
          <div className="order-not-found-icon">?</div>

          <h2>This order doesn't exist</h2>

          <p>The order may have been deleted or is no longer available.</p>

          <button
            type="button"
            className="record-order-button"
            onClick={() => navigate("/orders")}
          >
            Back to orders
          </button>
        </section>
      </main>
    );
  }

  const customerName =
    typeof order.customer === "string"
      ? order.customer
      : order.customer?.name || "Unnamed customer";

  const customerPhone =
    typeof order.customer === "string"
      ? "No phone number"
      : order.customer?.phone || "No phone number";

  const orderItems = Array.isArray(order.items) ? order.items : [];

  const orderTotal = Number(order.total) || 0;
  const amountPaid = Number(order.amountPaid) || 0;
  const balance = Math.max(Number(order.balance) || 0, 0);

  return (
    <main className="order-details-page">
      {/* Header */}
      <header className="order-details-header">
        <button
          type="button"
          className="order-details-back"
          onClick={() => navigate("/orders")}
          aria-label="Back to orders"
        >
          ←
        </button>

        <div>
          <p>ORDER</p>
          <h1>Order details</h1>
        </div>

        <button
          type="button"
          className="order-edit-button"
          onClick={() => navigate(`/orders/${order.id}/edit`)}
        >
          Edit
        </button>
      </header>

      {/* Order summary */}
      <section className="order-summary-card">
        <div className="order-summary-top">
          <div>
            <p className="order-detail-eyebrow">ORDER #{order.id}</p>

            <h2>₦{orderTotal.toLocaleString()}</h2>
          </div>

          <button
            type="button"
            className="order-status-badge order-status-button"
            onClick={() => setShowStatusOptions(true)}
          >
            {order.status}
          </button>
        </div>

        <div className="order-summary-meta">
          <span>
            {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
          </span>

          <span>•</span>

          <span>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "Unknown date"}
          </span>
        </div>
      </section>

      {/* Status options */}
      {showStatusOptions && (
        <section className="status-options-card">
          <div className="status-options-header">
            <div>
              <p className="section-eyebrow">ORDER STATUS</p>
              <h2>Update status</h2>
            </div>

            <button
              type="button"
              className="status-options-close"
              onClick={() => setShowStatusOptions(false)}
              aria-label="Close status options"
            >
              ×
            </button>
          </div>

          <div className="status-options-list">
            {["New", "Processing", "Delivered"].map((status) => (
              <button
                type="button"
                key={status}
                className={`status-option ${
                  order.status === status ? "active" : ""
                }`}
                onClick={() => handleStatusChange(status)}
              >
                <span>{status}</span>

                {order.status === status && <span>✓</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Customer */}
      <section className="order-detail-section">
        <div className="order-detail-section-heading">
          <span className="detail-section-icon">♙</span>

          <div>
            <p className="section-eyebrow">CUSTOMER</p>
            <h2>Customer information</h2>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-row">
            <span>Name</span>
            <strong>{customerName}</strong>
          </div>

          <div className="detail-row">
            <span>Phone</span>
            <strong>{customerPhone}</strong>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="order-detail-section">
        <div className="order-detail-section-heading">
          <span className="detail-section-icon">▣</span>

          <div>
            <p className="section-eyebrow">ORDER</p>
            <h2>Items</h2>
          </div>
        </div>

        <div className="detail-card items-card">
          {orderItems.length === 0 ? (
            <p>No items recorded for this order.</p>
          ) : (
            orderItems.map((item) => {
              const quantity = Number(item.quantity) || 0;
              const price = Number(item.price) || 0;
              const itemTotal = quantity * price;

              return (
                <div className="order-item-row" key={item.id}>
                  <div>
                    <strong>{item.name || "Unnamed item"}</strong>

                    <p>
                      {quantity} × ₦{price.toLocaleString()}
                    </p>
                  </div>

                  <strong>₦{itemTotal.toLocaleString()}</strong>
                </div>
              );
            })
          )}

          <div className="detail-total-row">
            <span>Total</span>

            <strong>₦{orderTotal.toLocaleString()}</strong>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="order-detail-section">
        <div className="order-detail-section-heading">
          <span className="detail-section-icon">₦</span>

          <div>
            <p className="section-eyebrow">PAYMENT</p>
            <h2>Payment information</h2>
          </div>
        </div>

        <div className="detail-card payment-detail-card">
          <div className="detail-row">
            <span>Status</span>
            <strong>{order.paymentStatus}</strong>
          </div>

          <div className="detail-row">
            <span>Amount paid</span>
            <strong>₦{amountPaid.toLocaleString()}</strong>
          </div>

          <div className="detail-row">
            <span>Balance</span>
            <strong>₦{balance.toLocaleString()}</strong>
          </div>

          {balance > 0 && (
            <button
              type="button"
              className="update-payment-button"
              onClick={openPaymentUpdate}
            >
              + Record payment
            </button>
          )}
        </div>
      </section>

      {/* Payment update form */}
      {showPaymentUpdate && (
        <div className="payment-update-overlay">
          <form className="payment-update-card" onSubmit={handlePaymentUpdate}>
            <div className="payment-update-header">
              <div>
                <p className="section-eyebrow">PAYMENT</p>
                <h2>Record payment</h2>
              </div>

              <button
                type="button"
                className="payment-update-close"
                onClick={closePaymentUpdate}
                aria-label="Close payment form"
              >
                ×
              </button>
            </div>

            <div className="payment-update-summary">
              <div>
                <span>Outstanding balance</span>

                <strong>₦{balance.toLocaleString()}</strong>
              </div>
            </div>

            <div className="form-field payment-update-field">
              <label htmlFor="payment-amount">Payment received</label>

              <input
                id="payment-amount"
                type="number"
                min="1"
                max={balance}
                step="1"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(event) => {
                  setPaymentAmount(event.target.value);

                  if (paymentError) {
                    setPaymentError("");
                  }
                }}
                autoFocus
                required
              />

              <p>Maximum payment: ₦{balance.toLocaleString()}</p>

              {paymentError && <p className="payment-error">{paymentError}</p>}
            </div>

            <div className="payment-update-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closePaymentUpdate}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                Save payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery */}
      <section className="order-detail-section">
        <div className="order-detail-section-heading">
          <span className="detail-section-icon">⌖</span>

          <div>
            <p className="section-eyebrow">DELIVERY</p>
            <h2>Delivery information</h2>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-row detail-row-column">
            <span>Address</span>

            <strong>{order.delivery?.address || "No delivery address"}</strong>
          </div>

          <div className="detail-row">
            <span>Status</span>

            <strong>{order.delivery?.status || "Pending"}</strong>
          </div>
        </div>
      </section>

      {/* Follow-up */}
      {order.followUp?.enabled && (
        <section className="order-detail-section">
          <div className="order-detail-section-heading">
            <span className="detail-section-icon">◷</span>

            <div>
              <p className="section-eyebrow">FOLLOW-UP</p>
              <h2>Follow-up</h2>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-row">
              <span>Date</span>

              <strong>{order.followUp.date || "No date"}</strong>
            </div>

            <div className="detail-row detail-row-column">
              <span>Reason</span>

              <strong>{order.followUp.reason || "No reason provided"}</strong>
            </div>
          </div>
        </section>
      )}

      {/* Notes */}
      {order.notes && (
        <section className="order-detail-section">
          <div className="order-detail-section-heading">
            <span className="detail-section-icon">✎</span>

            <div>
              <p className="section-eyebrow">NOTES</p>
              <h2>Additional notes</h2>
            </div>
          </div>

          <div className="detail-card notes-card">
            <p>{order.notes}</p>
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="order-detail-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate(`/orders/${order.id}/edit`)}
        >
          Edit order
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/orders")}
        >
          Back to orders
        </button>

        <button
          type="button"
          className="delete-order-button"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete order
        </button>
      </section>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-card">
            <div className="delete-confirm-icon">!</div>

            <h2>Delete this order?</h2>

            <p>
              This will permanently remove the order from Reepin. This action
              cannot be undone.
            </p>

            <div className="delete-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OrderDetails;
