export function paginateItems(items, currentPage, pageSize) {
  const startIndex = (currentPage - 1) * pageSize;

  return items.slice(startIndex, startIndex + pageSize);
}

export function getTotalPages(itemsCount, pageSize) {
  return Math.max(1, Math.ceil(itemsCount / pageSize));
}
