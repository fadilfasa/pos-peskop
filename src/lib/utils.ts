export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getLogicalToday(date: Date = new Date()): Date {
  const logicalDate = new Date(date);
  // If the time is before 6 AM, consider it part of the previous day's shift
  if (logicalDate.getHours() < 6) {
    logicalDate.setDate(logicalDate.getDate() - 1);
  }
  return logicalDate;
}

export function getToday(): string {
  return getLogicalToday().toISOString().split("T")[0];
}

export function getLocalTodayUTC(): Date {
  const now = getLogicalToday();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getExpenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    FUEL: "Bensin",
    FOOD: "Makan",
    PARKING: "Parkir",
    OTHER: "Lainnya",
  };
  return labels[category] || category;
}

export function getPaymentMethodLabel(method: string): string {
  return method === "CASH" ? "Tunai" : "QRIS";
}

export function getClosingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    BALANCED: "Seimbang",
    SURPLUS: "Lebih",
    DEFICIT: "Kurang",
  };
  return labels[status] || status;
}

export function getClosingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    BALANCED: "text-emerald-600",
    SURPLUS: "text-blue-600",
    DEFICIT: "text-red-600",
  };
  return colors[status] || "text-gray-500";
}
