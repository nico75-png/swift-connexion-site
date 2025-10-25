export interface FormatDateOptions {
  withTime?: boolean;
}

export const formatCurrencyEUR = (value: number | null | undefined, minimumFractionDigits = 2) => {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits,
    maximumFractionDigits: Math.max(2, minimumFractionDigits),
  }).format(amount);
};

export const formatDateFR = (input: string | Date | number | null | undefined, options: FormatDateOptions = {}) => {
  if (input == null) {
    return "";
  }

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(options.withTime
      ? {
          hour: "2-digit" as const,
          minute: "2-digit" as const,
        }
      : {}),
  });

  return formatter.format(date);
};
