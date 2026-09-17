import { createContext, useContext, useEffect, useState } from "react";

import { calculatePayment, normalizeOrder } from "../utils/orderHelpers";

const OrderContext = createContext();

const STORAGE_KEY = "reepin_orders";

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEY);

      if (!savedOrders) {
        return [];
      }

      const parsedOrders = JSON.parse(savedOrders);

      if (!Array.isArray(parsedOrders)) {
        return [];
      }

      return parsedOrders.map((order) => {
        const normalizedOrder = normalizeOrder(order);

        return {
          ...normalizedOrder,
          ...calculatePayment(
            normalizedOrder.total,
            normalizedOrder.amountPaid,
          ),
        };
      });
    } catch (error) {
      console.error("Failed to load saved orders:", error);

      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error("Failed to save orders:", error);
    }
  }, [orders]);

  const addOrder = (order) => {
    const normalizedOrder = normalizeOrder(order);

    const payment = calculatePayment(
      normalizedOrder.total,
      normalizedOrder.amountPaid,
    );

    setOrders((currentOrders) => [
      {
        ...normalizedOrder,
        ...payment,
      },
      ...currentOrders,
    ]);
  };

  const updateOrder = (id, updates) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (String(order.id) !== String(id)) {
          return order;
        }

        const updatedOrder = normalizeOrder({
          ...order,
          ...updates,
        });

        const payment = calculatePayment(
          updatedOrder.total,
          updatedOrder.amountPaid,
        );

        return {
          ...updatedOrder,
          ...payment,
        };
      }),
    );
  };

  const deleteOrder = (id) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => String(order.id) !== String(id)),
    );
  };

  const getOrderById = (id) => {
    return orders.find((order) => String(order.id) === String(id));
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
