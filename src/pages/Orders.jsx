import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useOrders } from "../context/OrderContext";

function Orders() {
  const navigate = useNavigate();
  const { orders } = useOrders();

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filters = ["All", "New", "Processing", "Delivered"];

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return safeOrders.filter((order) => {
      if (!order || typeof order !== "object") {
        return false;
      }

      const customer =
        typeof order.customer === "string"
          ? {
              name: order.customer,
              phone: "",
            }
          : {
              name: order.customer?.name || "",
              phone: order.customer?.phone || "",
            };

      const items = Array.isArray(order.items) ? order.items : [];

      const productNames = items.map((item) => item?.name || "").join(" ");

      const searchableText = [
        customer.name,
        customer.phone,
        order.id,
        order.status,
        order.paymentStatus,
        productNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesFilter =
        activeFilter === "All" || order.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [safeOrders, search, activeFilter]);

  const hasOrders = safeOrders.length > 0;
  const hasMatches = filteredOrders.length > 0;

  const formatCurrency = (amount) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
      return "₦0";
    }

    return `₦${value.toLocaleString()}`;
  };

  const getCustomer = (order) => {
    if (typeof order?.customer === "string") {
      return {
        name: order.customer || "Unnamed customer",
        phone: "",
      };
    }

    return {
      name: order?.customer?.name || "Unnamed customer",
      phone: order?.customer?.phone || "",
    };
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

  const getPaymentLabel = (order) => {
    switch (order?.paymentStatus) {
      case "Paid":
        return "Paid";

      case "Partial":
      case "Partially paid":
        return "Partial";

      case "Unpaid":
      default:
        return "Unpaid";
    }
  };

  const getPaymentClass = (order) => {
    switch (order?.paymentStatus) {
      case "Paid":
        return "paid";

      case "Partial":
      case "Partially paid":
        return "partial";

      case "Unpaid":
      default:
        return "unpaid";
    }
  };

  return (
    <main className="orders-page">
      <section className="orders-header">
        <div>
          <p className="orders-eyebrow">BUSINESS</p>
          <h1>Orders</h1>
        </div>

        <button
          className="new-order-icon"
          onClick={() => navigate("/orders/new")}
          aria-label="Create new order"
          type="button"
        >
          +
        </button>
      </section>

      <div className="orders-search">
        <span aria-hidden="true">⌕</span>

        <input
          type="search"
          placeholder="Search orders..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search orders"
        />
      </div>

      <div className="order-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            className={
              activeFilter === filter ? "filter-button active" : "filter-button"
            }
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      {!hasOrders ? (
        <section className="orders-empty">
          <div className="orders-empty-icon">▣</div>

          <h2>No orders yet</h2>

          <p>
            Record your first customer order and keep everything organized in
            one place.
          </p>

          <button
            className="record-order-button"
            onClick={() => navigate("/orders/new")}
            type="button"
          >
            + Record an order
          </button>
        </section>
      ) : !hasMatches ? (
        <section className="orders-empty">
          <div className="orders-empty-icon">⌕</div>

          <h2>No matching orders</h2>

          <p>Try a different search term or change the order filter.</p>

          <button
            className="record-order-button"
            onClick={() => {
              setSearch("");
              setActiveFilter("All");
            }}
            type="button"
          >
            Clear filters
          </button>
        </section>
      ) : (
        <section className="orders-list">
          {filteredOrders.map((order) => {
            const customer = getCustomer(order);
            const itemCount = getItemCount(order);
            const paymentLabel = getPaymentLabel(order);
            const paymentClass = getPaymentClass(order);

            return (
              <button
                className="order-card"
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                type="button"
              >
                <div className="order-card-main">
                  <strong>{customer.name}</strong>

                  <p>
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>

                  {customer.phone && <small>{customer.phone}</small>}
                </div>

                <div className="order-card-right">
                  <strong>{formatCurrency(order.total)}</strong>

                  <span>{order.status || "New"}</span>

                  <small className={`order-payment ${paymentClass}`}>
                    {paymentLabel}
                  </small>
                </div>
              </button>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Orders;
