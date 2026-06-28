export function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("sr-RS");
}

export function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("sr-RS");
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
  }).format(value);
}
