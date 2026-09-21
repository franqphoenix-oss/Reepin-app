export const formatCurrency = (amount, currency = "₦") => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${currency}0`;
  }

  return `${currency}${value.toLocaleString()}`;
};
