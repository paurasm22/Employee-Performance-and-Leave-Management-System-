export function getMonthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 0, 23, 59, 59);

  return { start, end };
}

export function statusToColor(status: string) {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "tie":
      return "orange";
    default:
      return "yellow"; // pending
  }
}
