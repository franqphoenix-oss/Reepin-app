export const CURRENCY_OPTIONS = [
  {
    symbol: "₦",
    name: "Nigerian Naira",
  },
  {
    symbol: "$",
    name: "US Dollar",
  },
  {
    symbol: "£",
    name: "British Pound",
  },
  {
    symbol: "€",
    name: "Euro",
  },
];

export const getCurrencyName = (currency) => {
  const match = CURRENCY_OPTIONS.find((option) => option.symbol === currency);

  return match ? match.name : currency;
};

export const formatCurrency = (amount, currency = "₦") => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${currency}0`;
  }

  return `${currency}${value.toLocaleString()}`;
};
