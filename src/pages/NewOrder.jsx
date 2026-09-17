import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useOrders } from "../context/OrderContext";
import { useApp } from "../context/AppContext";
import { calculatePayment } from "../utils/orderHelpers";

function getNotifyAt(date, time, leadTime) {
  if (!date) {
    return "";
  }

  const safeTime = time || "09:00";
  const scheduledDate = new Date(`${date}T${safeTime}`);

  if (Number.isNaN(scheduledDate.getTime())) {
    return "";
  }

  switch (leadTime) {
    case "1hour":
      scheduledDate.setHours(scheduledDate.getHours() - 1);
      break;

    case "1day":
      scheduledDate.setDate(scheduledDate.getDate() - 1);
      break;

    case "2days":
      scheduledDate.setDate(scheduledDate.getDate() - 2);
      break;

    case "sameDay":
    default:
      break;
  }

  return scheduledDate.toISOString();
}

function NewOrder() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { addOrder, updateOrder, getOrderById } = useOrders();

  const { settings } = useApp();

  const isEditMode = Boolean(orderId);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
  });

  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: "",
      quantity: 1,
      price: "",
    },
  ]);

  const [amountPaid, setAmountPaid] = useState("");

  const [delivery, setDelivery] = useState({
    address: "",
    status: "Pending",
  });

  const [followUp, setFollowUp] = useState({
    enabled: false,
    date: "",
    time: "",
    reason: "",
    notify: false,
    notifyAt: "",
    completed: false,
  });

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const existingOrder = getOrderById(orderId);

    if (!existingOrder) {
      navigate("/orders");
      return;
    }

    setCustomer(existingOrder.customer);

    setItems(
      existingOrder.items.length > 0
        ? existingOrder.items
        : [
            {
              id: Date.now(),
              name: "",
              quantity: 1,
              price: "",
            },
          ],
    );

    setAmountPaid(
      existingOrder.amountPaid ? String(existingOrder.amountPaid) : "",
    );

    setDelivery(existingOrder.delivery);

    setFollowUp({
      enabled: Boolean(existingOrder.followUp?.enabled),
      date: existingOrder.followUp?.date || "",
      time: existingOrder.followUp?.time || "",
      reason: existingOrder.followUp?.reason || "",
      notify: Boolean(existingOrder.followUp?.notify),
      notifyAt: existingOrder.followUp?.notifyAt || "",
      completed: Boolean(existingOrder.followUp?.completed),
    });

    setNotes(existingOrder.notes);
  }, [isEditMode, orderId, getOrderById, navigate]);

  const total = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;

    return sum + quantity * price;
  }, 0);

  /*
   * Payment is derived entirely from the order total
   * and the amount the customer has actually paid.
   */
  const payment = calculatePayment(total, amountPaid);
  const balance = payment.balance;

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: "",
        quantity: 1,
        price: "",
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;

    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const updateFollowUp = (updates) => {
    setFollowUp((currentFollowUp) => ({
      ...currentFollowUp,
      ...updates,
    }));
  };

  const handleFollowUpToggle = () => {
    setFollowUp((currentFollowUp) => {
      const enabled = !currentFollowUp.enabled;

      if (!enabled) {
        return {
          ...currentFollowUp,
          enabled: false,
          notify: false,
          notifyAt: "",
        };
      }

      return {
        ...currentFollowUp,
        enabled: true,
      };
    });
  };

  const handleFollowUpNotifyToggle = () => {
    setFollowUp((currentFollowUp) => {
      const notify = !currentFollowUp.notify;

      return {
        ...currentFollowUp,
        notify,
        notifyAt: notify
          ? getNotifyAt(
              currentFollowUp.date,
              currentFollowUp.time,
              settings.notifications.defaultLeadTime,
            )
          : "",
      };
    });
  };

  const handleFollowUpDateChange = (event) => {
    const date = event.target.value;

    setFollowUp((currentFollowUp) => ({
      ...currentFollowUp,
      date,
      notifyAt: currentFollowUp.notify
        ? getNotifyAt(
            date,
            currentFollowUp.time,
            settings.notifications.defaultLeadTime,
          )
        : "",
    }));
  };

  const handleFollowUpTimeChange = (event) => {
    const time = event.target.value;

    setFollowUp((currentFollowUp) => ({
      ...currentFollowUp,
      time,
      notifyAt: currentFollowUp.notify
        ? getNotifyAt(
            currentFollowUp.date,
            time,
            settings.notifications.defaultLeadTime,
          )
        : "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    /*
     * Calculate payment one final time when saving.
     * This guarantees the stored order always contains
     * a valid payment status, amount paid and balance.
     */
    const payment = calculatePayment(total, amountPaid);

    /*
     * Recalculate the reminder timestamp when saving.
     *
     * This is especially important when editing/rescheduling
     * an existing follow-up.
     */
    const finalFollowUp = {
      ...followUp,
      notifyAt:
        followUp.enabled && followUp.notify
          ? getNotifyAt(
              followUp.date,
              followUp.time,
              settings.notifications.defaultLeadTime,
            )
          : "",
    };

    const orderData = {
      customer,
      items,
      ...payment,
      delivery,
      followUp: finalFollowUp,
      notes,
    };

    if (isEditMode) {
      updateOrder(orderId, orderData);
      navigate(`/orders/${orderId}`);
      return;
    }

    const newOrder = {
      id: Date.now(),
      ...orderData,
      status: "New",
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);

    navigate("/orders");
  };

  return (
    <main className="new-order-page">
      <header className="new-order-header">
        <button
          className="new-order-back"
          type="button"
          onClick={() =>
            navigate(isEditMode ? `/orders/${orderId}` : "/orders")
          }
          aria-label="Back to orders"
        >
          ←
        </button>

        <div>
          <p>ORDER</p>
          <h1>{isEditMode ? "Edit order" : "New order"}</h1>
        </div>

        <div className="new-order-header-spacer" />
      </header>

      <form className="new-order-form" onSubmit={handleSubmit}>
        {/* CUSTOMER */}
        <section className="order-form-section">
          <div className="form-section-heading">
            <span className="form-section-number">01</span>

            <div>
              <h2>Customer</h2>
              <p>Who is placing this order?</p>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="customer-name">Customer name</label>

            <input
              id="customer-name"
              type="text"
              placeholder="e.g. John Doe"
              value={customer.name}
              onChange={(event) =>
                setCustomer({
                  ...customer,
                  name: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="customer-phone">WhatsApp / Phone</label>

            <input
              id="customer-phone"
              type="tel"
              placeholder="e.g. 08012345678"
              value={customer.phone}
              onChange={(event) =>
                setCustomer({
                  ...customer,
                  phone: event.target.value,
                })
              }
              required
            />
          </div>
        </section>

        {/* ITEMS */}
        <section className="order-form-section">
          <div className="form-section-heading">
            <span className="form-section-number">02</span>

            <div>
              <h2>Order items</h2>
              <p>What did the customer order?</p>
            </div>
          </div>

          <div className="order-items">
            {items.map((item, index) => (
              <div className="order-item" key={item.id}>
                <div className="order-item-top">
                  <span>Item {index + 1}</span>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Product or service"
                  value={item.name}
                  onChange={(event) =>
                    updateItem(item.id, "name", event.target.value)
                  }
                  required
                />

                <div className="item-price-row">
                  <div>
                    <label>Quantity</label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, "quantity", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Price</label>

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.price}
                      onChange={(event) =>
                        updateItem(item.id, "price", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="add-item-button" onClick={addItem}>
            + Add another item
          </button>
        </section>

        {/* PAYMENT */}
        <section className="order-form-section">
          <div className="form-section-heading">
            <span className="form-section-number">03</span>

            <div>
              <h2>Payment</h2>
              <p>Track what has been paid.</p>
            </div>
          </div>

          <div className="payment-summary">
            <div>
              <span>Order total</span>
              <strong>₦{total.toLocaleString()}</strong>
            </div>

            <div>
              <span>Amount paid</span>
              <strong>₦{payment.amountPaid.toLocaleString()}</strong>
            </div>

            <div>
              <span>Balance</span>
              <strong>₦{balance.toLocaleString()}</strong>
            </div>
          </div>

          <div className="payment-status-display">
            <span>Payment status</span>

            <strong
              className={`payment-status-badge ${payment.paymentStatus.toLowerCase()}`}
            >
              {payment.paymentStatus}
            </strong>
          </div>

          <div className="form-field">
            <label htmlFor="amount-paid">Amount paid</label>

            <input
              id="amount-paid"
              type="number"
              min="0"
              max={total}
              placeholder="0"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
            />

            <small>Enter the amount the customer has paid so far.</small>
          </div>
        </section>

        {/* DELIVERY */}
        <section className="order-form-section">
          <div className="form-section-heading">
            <span className="form-section-number">04</span>

            <div>
              <h2>Delivery</h2>
              <p>Where should the order go?</p>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="delivery-address">Delivery address</label>

            <textarea
              id="delivery-address"
              placeholder="Enter customer's delivery address"
              value={delivery.address}
              onChange={(event) =>
                setDelivery({
                  ...delivery,
                  address: event.target.value,
                })
              }
              rows="3"
            />
          </div>

          <div className="delivery-status">
            {["Pending", "Ready", "Out for delivery"].map((status) => (
              <button
                type="button"
                key={status}
                className={
                  delivery.status === status
                    ? "delivery-option active"
                    : "delivery-option"
                }
                onClick={() =>
                  setDelivery({
                    ...delivery,
                    status,
                  })
                }
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* FOLLOW-UP */}
        <section className="order-form-section">
          <div className="form-section-heading">
            <span className="form-section-number">05</span>

            <div>
              <h2>Follow-up</h2>
              <p>Don't lose track of this customer.</p>
            </div>
          </div>

          <button
            type="button"
            className={
              followUp.enabled ? "follow-up-toggle active" : "follow-up-toggle"
            }
            onClick={handleFollowUpToggle}
          >
            <span>{followUp.enabled ? "✓" : "+"}</span>

            {followUp.enabled ? "Follow-up enabled" : "Add a follow-up"}
          </button>

          {followUp.enabled && (
            <div className="follow-up-fields">
              <div className="form-field">
                <label htmlFor="follow-up-date">Follow-up date</label>

                <input
                  id="follow-up-date"
                  type="date"
                  value={followUp.date}
                  onChange={handleFollowUpDateChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="follow-up-time">Follow-up time</label>

                <input
                  id="follow-up-time"
                  type="time"
                  value={followUp.time}
                  onChange={handleFollowUpTimeChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="follow-up-reason">Reason</label>

                <input
                  id="follow-up-reason"
                  type="text"
                  placeholder="e.g. Confirm delivery"
                  value={followUp.reason}
                  onChange={(event) =>
                    updateFollowUp({
                      reason: event.target.value,
                    })
                  }
                />
              </div>

              {/* NOTIFICATION */}
              <button
                type="button"
                className={
                  followUp.notify
                    ? "follow-up-notify-toggle active"
                    : "follow-up-notify-toggle"
                }
                onClick={handleFollowUpNotifyToggle}
                disabled={!settings.notifications.enabled}
              >
                <span className="follow-up-notify-icon">
                  {followUp.notify ? "✓" : "◷"}
                </span>

                <div className="follow-up-notify-content">
                  <strong>
                    {followUp.notify ? "Reminder enabled" : "Remind me"}
                  </strong>

                  <small>
                    {settings.notifications.enabled
                      ? followUp.notifyAt
                        ? `Reepin will remind you ${formatReminderTime(
                            followUp.notifyAt,
                          )}.`
                        : "Use your notification preferences for this follow-up."
                      : "Notifications are disabled in Settings."}
                  </small>
                </div>

                <span className="follow-up-notify-indicator">
                  {followUp.notify ? "On" : "Off"}
                </span>
              </button>
            </div>
          )}
        </section>

        {/* NOTES */}
        <section className="order-form-section">
          <div className="form-section-heading">
            <span className="form-section-number">06</span>

            <div>
              <h2>Notes</h2>
              <p>Anything else to remember?</p>
            </div>
          </div>

          <textarea
            className="order-notes"
            placeholder="Add notes about this order..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows="4"
          />
        </section>

        {/* SAVE */}
        <div className="save-order-area">
          <div className="save-order-total">
            <span>Total</span>
            <strong>₦{total.toLocaleString()}</strong>
          </div>

          <button type="submit" className="save-order-button">
            {isEditMode ? "Save changes" : "Save order"}
          </button>
        </div>
      </form>
    </main>
  );
}

function formatReminderTime(notifyAt) {
  const date = new Date(notifyAt);

  if (Number.isNaN(date.getTime())) {
    return "at the scheduled time";
  }

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default NewOrder;
