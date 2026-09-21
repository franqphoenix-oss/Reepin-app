import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useOrders } from "../context/OrderContext";
import { useApp } from "../context/AppContext";

import { formatCurrency as formatMoney } from "../utils/currency";

import "./pages-css/FollowUps.css";

const NOTIFICATION_STORAGE_KEY = "reepin_followup_notifications";

function getFollowUpDate(date, time = "09:00") {
  if (!date) {
    return null;
  }

  const safeTime = time || "09:00";
  const parsedDate = new Date(`${date}T${safeTime}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatDate(date, time) {
  const parsedDate = getFollowUpDate(date, time);

  if (!parsedDate) {
    return "No date";
  }

  return parsedDate.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCustomerName(order) {
  if (typeof order?.customer === "string") {
    return order.customer || "Unnamed customer";
  }

  return order?.customer?.name || "Unnamed customer";
}

function getNotificationStorage() {
  try {
    const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Failed to load follow-up notification history:", error);

    return {};
  }
}

function saveNotificationStorage(history) {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save follow-up notification history:", error);
  }
}

function getLeadTimeMilliseconds(leadTime) {
  switch (leadTime) {
    case "1hour":
      return 60 * 60 * 1000;

    case "1day":
      return 24 * 60 * 60 * 1000;

    case "2days":
      return 2 * 24 * 60 * 60 * 1000;

    case "sameDay":
    default:
      return 0;
  }
}

function FollowUps() {
  const navigate = useNavigate();

  const { orders, updateOrder } = useOrders();
  const { settings } = useApp();

  const safeOrders = Array.isArray(orders) ? orders : [];

  const followUps = useMemo(() => {
    return safeOrders.filter(
      (order) =>
        order &&
        typeof order === "object" &&
        order.followUp?.enabled &&
        !order.followUp?.completed,
    );
  }, [safeOrders]);

  const today = useMemo(() => {
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    return currentDate;
  }, []);

  const upcomingFollowUps = useMemo(() => {
    return followUps
      .filter((order) => {
        const followUpDate = getFollowUpDate(
          order.followUp?.date,
          order.followUp?.time,
        );

        return followUpDate && followUpDate >= today;
      })
      .sort((a, b) => {
        const dateA = getFollowUpDate(a.followUp?.date, a.followUp?.time);

        const dateB = getFollowUpDate(b.followUp?.date, b.followUp?.time);

        return dateA - dateB;
      });
  }, [followUps, today]);

  const overdueFollowUps = useMemo(() => {
    return followUps
      .filter((order) => {
        const followUpDate = getFollowUpDate(
          order.followUp?.date,
          order.followUp?.time,
        );

        return followUpDate && followUpDate < today;
      })
      .sort((a, b) => {
        const dateA = getFollowUpDate(a.followUp?.date, a.followUp?.time);

        const dateB = getFollowUpDate(b.followUp?.date, b.followUp?.time);

        return dateA - dateB;
      });
  }, [followUps, today]);

  /*
   * Check whether any follow-up reminders are due.
   *
   * window.alert() is intentionally used for V1.
   * This only works while the Reepin app is open.
   */
  useEffect(() => {
    if (!settings.notifications.enabled) {
      return;
    }

    if (settings.notifications.type !== "alert") {
      return;
    }

    const checkNotifications = () => {
      const now = Date.now();

      const notificationHistory = getNotificationStorage();

      let historyChanged = false;

      followUps.forEach((order) => {
        const followUp = order.followUp;

        if (!followUp?.notify) {
          return;
        }

        const scheduledDate = getFollowUpDate(followUp.date, followUp.time);

        if (!scheduledDate) {
          return;
        }

        /*
         * Prefer the stored notifyAt timestamp.
         *
         * If an older follow-up does not have one,
         * calculate it from the current default lead time.
         */
        let notificationDate = followUp.notifyAt
          ? new Date(followUp.notifyAt)
          : new Date(
              scheduledDate.getTime() -
                getLeadTimeMilliseconds(settings.notifications.defaultLeadTime),
            );

        if (Number.isNaN(notificationDate.getTime())) {
          return;
        }

        if (notificationDate.getTime() > now) {
          return;
        }

        const notificationId = `${order.id}-${followUp.date}-${followUp.time}-${followUp.notifyAt}`;

        /*
         * Once a specific reminder has been shown,
         * don't show it again on every render.
         */
        if (notificationHistory[notificationId]) {
          return;
        }

        const customerName = getCustomerName(order);

        const scheduledText = formatDate(followUp.date, followUp.time);

        const profileName = settings.profile?.name || "there";

        const reason = followUp.reason
          ? `Reason: ${followUp.reason}.`
          : "You scheduled a customer follow-up.";

        window.alert(
          `Hey ${profileName} 👋\n\n` +
            `You scheduled a follow-up for ${customerName} ` +
            `on ${scheduledText}.\n\n` +
            `${reason}`,
        );

        notificationHistory[notificationId] = new Date().toISOString();

        historyChanged = true;
      });

      if (historyChanged) {
        saveNotificationStorage(notificationHistory);
      }
    };

    checkNotifications();

    /*
     * Check periodically while the page remains open.
     */
    const interval = setInterval(checkNotifications, 30 * 1000);

    return () => clearInterval(interval);
  }, [followUps, settings.notifications, settings.profile]);

  const getFollowUpState = (order) => {
    const followUpDate = getFollowUpDate(
      order.followUp?.date,
      order.followUp?.time,
    );

    if (!followUpDate) {
      return "No date";
    }

    return followUpDate < today ? "Overdue" : "Upcoming";
  };

  const handleComplete = (event, order) => {
    event.stopPropagation();

    updateOrder(order.id, {
      followUp: {
        ...order.followUp,
        completed: true,
      },
    });
  };

  const renderFollowUpCard = (order) => {
    const followUpState = getFollowUpState(order);

    return (
      <article className="follow-up-card" key={order.id}>
        <button
          className="follow-up-card-main"
          onClick={() => navigate(`/orders/${order.id}`)}
          type="button"
        >
          <div className="follow-up-card-top">
            <div className="follow-up-date">
              <span className="follow-up-date-icon">◷</span>

              <div>
                <strong>
                  {formatDate(order.followUp?.date, order.followUp?.time)}
                </strong>

                <span
                  className={`follow-up-state ${
                    followUpState === "Overdue" ? "overdue" : ""
                  }`}
                >
                  {followUpState}
                </span>
              </div>
            </div>

            <span className="follow-up-arrow">→</span>
          </div>

          <div className="follow-up-card-content">
            <strong>{getCustomerName(order)}</strong>

            <p>
              Order #{order.id} ·{" "}
              {formatCurrency(order.total, settings.currency)}
            </p>
          </div>

          <div className="follow-up-reason">
            <span>Reason</span>

            <strong>{order.followUp?.reason || "No reason provided"}</strong>
          </div>

          {order.followUp?.notify && (
            <div className="follow-up-reminder-status">
              <span>◷</span>
              <span>Reminder enabled</span>
            </div>
          )}
        </button>

        <div className="follow-up-card-actions">
          <button
            type="button"
            className="follow-up-edit-button"
            onClick={() => navigate(`/orders/${order.id}/edit`)}
          >
            Edit / Reschedule
          </button>

          <button
            type="button"
            className="follow-up-complete-button"
            onClick={(event) => handleComplete(event, order)}
          >
            Mark done
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className="follow-ups-page">
      <header className="follow-ups-header">
        <div>
          <p className="section-eyebrow">RETAIN & FOLLOW UP</p>

          <h1>Follow-ups</h1>

          <p className="follow-ups-subtitle">
            Stay on top of customers who need your attention.
          </p>
        </div>

        <div className="follow-ups-count">
          <strong>{followUps.length}</strong>
          <span>active</span>
        </div>
      </header>

      <section className="follow-up-summary">
        <div className="follow-up-summary-card">
          <span className="follow-up-summary-icon">◷</span>

          <div>
            <strong>{upcomingFollowUps.length}</strong>

            <span>Upcoming</span>
          </div>
        </div>

        <div className="follow-up-summary-card overdue-summary">
          <span className="follow-up-summary-icon">!</span>

          <div>
            <strong>{overdueFollowUps.length}</strong>

            <span>Overdue</span>
          </div>
        </div>
      </section>

      {followUps.length === 0 ? (
        <section className="follow-up-empty-state">
          <div className="follow-up-empty-icon">◷</div>

          <h2>No follow-ups yet</h2>

          <p>
            Follow-ups you add to your orders will appear here so you never lose
            track of a customer.
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
        <div className="follow-up-lists">
          {overdueFollowUps.length > 0 && (
            <section className="follow-up-section">
              <div className="follow-up-section-heading">
                <div>
                  <p className="section-eyebrow">NEEDS ATTENTION</p>

                  <h2>Overdue</h2>
                </div>

                <span className="follow-up-section-count">
                  {overdueFollowUps.length}
                </span>
              </div>

              <div className="follow-up-card-list">
                {overdueFollowUps.map(renderFollowUpCard)}
              </div>
            </section>
          )}

          {upcomingFollowUps.length > 0 && (
            <section className="follow-up-section">
              <div className="follow-up-section-heading">
                <div>
                  <p className="section-eyebrow">NEXT UP</p>

                  <h2>Upcoming</h2>
                </div>

                <span className="follow-up-section-count">
                  {upcomingFollowUps.length}
                </span>
              </div>

              <div className="follow-up-card-list">
                {upcomingFollowUps.map(renderFollowUpCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

export default FollowUps;
