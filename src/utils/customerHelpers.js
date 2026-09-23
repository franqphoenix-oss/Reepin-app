export const normalizeCustomerName = (name = "") => {
  return String(name).trim().replace(/\s+/g, " ").toLowerCase();
};

export const normalizeCustomerPhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("234")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }

  return digits;
};

export const getCustomerIdentity = (customer) => {
  const name =
    typeof customer === "string"
      ? customer.trim()
      : customer?.name?.trim() || "";

  const phone =
    typeof customer === "string" ? "" : customer?.phone?.trim() || "";

  const normalizedName = normalizeCustomerName(name);
  const normalizedPhone = normalizeCustomerPhone(phone);

  return {
    name,
    phone,
    normalizedName,
    normalizedPhone,
  };
};

export const buildCustomersFromOrders = (orders = []) => {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const customers = [];

  safeOrders.forEach((order) => {
    if (!order || typeof order !== "object") {
      return;
    }

    const identity = getCustomerIdentity(order.customer);

    if (!identity.name) {
      return;
    }

    let customer = null;

    /*
     * First preference:
     * exact phone-number match.
     */
    if (identity.normalizedPhone) {
      customer = customers.find(
        (existing) => existing.normalizedPhone === identity.normalizedPhone,
      );
    }

    /*
     * If this order has no phone, use the customer's name.
     */
    if (!customer && !identity.normalizedPhone) {
      customer = customers.find(
        (existing) =>
          !existing.normalizedPhone &&
          existing.normalizedName === identity.normalizedName,
      );
    }

    /*
     * If an older record had only a name and a newer order
     * provides a phone number, connect the two records when
     * the names match.
     */
    if (!customer && identity.normalizedPhone) {
      const nameMatches = customers.filter(
        (existing) =>
          !existing.normalizedPhone &&
          existing.normalizedName === identity.normalizedName,
      );

      if (nameMatches.length === 1) {
        customer = nameMatches[0];
      }
    }

    /*
     * If a customer already exists by phone but their name
     * changed, keep the newest name.
     */
    if (!customer) {
      customer = {
        id: identity.normalizedPhone || identity.normalizedName,
        name: identity.name,
        phone: identity.phone,
        normalizedName: identity.normalizedName,
        normalizedPhone: identity.normalizedPhone,
        orders: [],
        totalSpent: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        lastOrderDate: order.createdAt || "",
      };

      customers.push(customer);
    }

    /*
     * Keep the latest available customer information.
     */
    if (identity.name) {
      customer.name = identity.name;
      customer.normalizedName = identity.normalizedName;
    }

    if (identity.phone) {
      customer.phone = identity.phone;
      customer.normalizedPhone = identity.normalizedPhone;
    }

    customer.orders.push(order);

    customer.totalSpent += Number(order.total) || 0;
    customer.totalPaid += Number(order.amountPaid) || 0;
    customer.outstandingBalance += Number(order.balance) || 0;

    const currentOrderDate = new Date(order.createdAt);
    const lastOrderDate = new Date(customer.lastOrderDate);

    if (
      !Number.isNaN(currentOrderDate.getTime()) &&
      (Number.isNaN(lastOrderDate.getTime()) ||
        currentOrderDate > lastOrderDate)
    ) {
      customer.lastOrderDate = order.createdAt;
    }
  });

  return customers
    .map((customer) => ({
      ...customer,
      orders: [...customer.orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    }))
    .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
};
