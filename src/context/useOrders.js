import { useContext } from "react";

import { OrderContext } from "./OrderContextValue";

export function useOrders() {
  return useContext(OrderContext);
}
