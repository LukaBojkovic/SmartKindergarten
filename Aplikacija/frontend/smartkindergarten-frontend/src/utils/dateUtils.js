export function getTodayDateInputValue() {
  return new Date().toISOString().substring(0, 10);
}

export function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return value.substring(0, 10);
}

export function toUtcIsoDate(value) {
  if (!value) {
    return null;
  }

  return `${value}T00:00:00Z`;
}
