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

const findMatchingCustomer = (customers, identity) => {
  if (identity.normalizedPhone) {
    const phoneMatch = customers.find(
      (customer) => customer.normalizedPhone === identity.normalizedPhone,
    );

    if (phoneMatch) {
      return phoneMatch;
    }
  }

  /*
   * When there is no phone number, a name match is only safe
   * when exactly one customer has that normalized name.
   *
   * This prevents:
   *
   * John + 08011111111
   * John + 08022222222
   *
   * from being merged into one customer just because a later
   * order contains "John" without a phone number.
   */
  if (identity.normalizedName) {
    const nameMatches = customers.filter(
      (customer) => customer.normalizedName === identity.normalizedName,
    );

    if (nameMatches.length === 1) {
      return nameMatches[0];
    }

    /*
     * If there is an existing name-only customer and no
     * conflicting phone-based customers, reuse it.
     */
    if (nameMatches.length === 0) {
      return null;
    }

    const nameOnlyMatch = nameMatches.find(
      (customer) => !customer.normalizedPhone,
    );

    if (nameOnlyMatch) {
      return nameOnlyMatch;
    }
  }

  return null;
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

    let customer = findMatchingCustomer(customers, identity);

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
     * Keep the most recently dated customer information.
     *
     * This prevents an older order from replacing newer
     * customer information simply because of array order.
     */
    const currentOrderDate = new Date(order.createdAt);
    const customerLastOrderDate = new Date(customer.lastOrderDate);

    const currentOrderIsNewer =
      !Number.isNaN(currentOrderDate.getTime()) &&
      (Number.isNaN(customerLastOrderDate.getTime()) ||
        currentOrderDate > customerLastOrderDate);

    if (currentOrderIsNewer || !customer.name) {
      customer.name = identity.name;
      customer.normalizedName = identity.normalizedName;
    }

    if (identity.phone && (!customer.normalizedPhone || currentOrderIsNewer)) {
      customer.phone = identity.phone;
      customer.normalizedPhone = identity.normalizedPhone;
    }

    customer.orders.push(order);

    customer.totalSpent += Number(order.total) || 0;
    customer.totalPaid += Number(order.amountPaid) || 0;
    customer.outstandingBalance += Number(order.balance) || 0;

    if (currentOrderIsNewer) {
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
