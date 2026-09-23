import { useNavigate } from "react-router-dom";

import "./pages-css/HelpSupport.css";

const HelpSupport = () => {
  const navigate = useNavigate();

  return (
    <main className="help-support-page">
      <header className="help-support-header">
        <button
          type="button"
          className="help-support-back"
          onClick={() => navigate("/settings")}
          aria-label="Back to settings"
        >
          ←
        </button>

        <div>
          <p className="section-eyebrow">SUPPORT</p>
          <h1>Help & Support</h1>
        </div>
      </header>

      <section className="help-support-intro">
        <div className="help-support-icon">?</div>

        <div>
          <h2>Need help with Reepin?</h2>

          <p>
            Find answers to common questions about managing orders, customers,
            payments and follow-ups.
          </p>
        </div>
      </section>

      <section className="help-support-section">
        <p className="settings-section-label">COMMON QUESTIONS</p>

        <div className="help-support-card">
          <article>
            <h3>How do I record an order?</h3>
            <p>
              Open Orders and choose “Record an order”. Add the customer, items,
              payment, delivery and follow-up information, then save.
            </p>
          </article>

          <article>
            <h3>How does payment tracking work?</h3>
            <p>
              Reepin calculates the order balance and payment status from the
              order total and amount paid.
            </p>
          </article>

          <article>
            <h3>Where do customer records come from?</h3>
            <p>
              Customers are created from the customer information attached to
              your recorded orders.
            </p>
          </article>

          <article>
            <h3>How do follow-up reminders work?</h3>
            <p>
              Add a follow-up to an order, choose when you want to follow up,
              and enable reminders if notifications are turned on.
            </p>
          </article>
        </div>
      </section>

      <section className="help-support-section">
        <p className="settings-section-label">APP INFORMATION</p>

        <div className="help-support-card help-support-app-info">
          <div>
            <strong>Reepin</strong>
            <span>Version 1.0.0</span>
          </div>

          <p>
            Reepin helps small businesses keep their orders, customers, payments
            and follow-ups organized in one place.
          </p>
        </div>
      </section>
    </main>
  );
};

export default HelpSupport;
