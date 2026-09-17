export const createEmptyOrder = () => ({
  id: null,

  customer: {
    name: "",
    phone: "",
  },

  items: [],

  total: 0,

  paymentStatus: "Unpaid",
  amountPaid: 0,
  balance: 0,

  delivery: {
    address: "",
    status: "Pending",
  },

  followUp: {
    enabled: false,
    date: "",
    time: "",
    reason: "",
    notify: false,
    notifyAt: "",
    completed: false,
  },

  notes: "",

  status: "New",

  createdAt: "",
});

/*
 * Payment status is derived from the actual amount paid.
 *
 * 0 paid       -> Unpaid
 * Some paid    -> Partial
 * Full paid    -> Paid
 */
export const calculatePayment = (total, amountPaid) => {
  const safeTotal = Math.max(Number(total) || 0, 0);

  const safeAmountPaid = Math.min(
    Math.max(Number(amountPaid) || 0, 0),
    safeTotal,
  );

  const balance = Math.max(safeTotal - safeAmountPaid, 0);

  let paymentStatus = "Unpaid";

  if (safeTotal > 0 && safeAmountPaid >= safeTotal) {
    paymentStatus = "Paid";
  } else if (safeAmountPaid > 0) {
    paymentStatus = "Partial";
  }

  return {
    total: safeTotal,
    amountPaid: safeAmountPaid,
    balance,
    paymentStatus,
  };
};

export const normalizeOrder = (order) => {
  const safeOrder = order || {};

  const customer =
    typeof safeOrder.customer === "string"
      ? {
          name: safeOrder.customer,
          phone: "",
        }
      : {
          name: safeOrder.customer?.name || "",
          phone: safeOrder.customer?.phone || "",
        };

  const items = Array.isArray(safeOrder.items)
    ? safeOrder.items.map((item, index) => ({
        id: item?.id ?? `${safeOrder.id || "item"}-${index}`,
        name: item?.name || "",
        quantity: Number(item?.quantity) || 1,
        price: Number(item?.price) || 0,
      }))
    : [];

  const total = Number(safeOrder.total) || 0;
  const amountPaid = Number(safeOrder.amountPaid) || 0;

  return {
    ...createEmptyOrder(),

    ...safeOrder,

    customer,

    items,

    total,

    amountPaid,

    balance: Math.max(total - amountPaid, 0),

    paymentStatus: safeOrder.paymentStatus || "Unpaid",

    delivery: {
      address: safeOrder.delivery?.address || "",
      status: safeOrder.delivery?.status || "Pending",
    },

    followUp: {
      enabled: Boolean(safeOrder.followUp?.enabled),
      date: safeOrder.followUp?.date || "",
      time: safeOrder.followUp?.time || "",
      reason: safeOrder.followUp?.reason || "",
      notify: Boolean(safeOrder.followUp?.notify),
      notifyAt: safeOrder.followUp?.notifyAt || "",
      completed: Boolean(safeOrder.followUp?.completed),
    },

    notes: safeOrder.notes || "",

    status: safeOrder.status || "New",

    createdAt: safeOrder.createdAt || new Date().toISOString(),
  };
};
