import { Money } from "@/models/Money";

const currencyLocales: Record<string, Intl.LocalesArgument> = {
  IDR: "id-ID",
  USD: "en-US",
  EUR: "de-DE",
  JPY: "ja-JP",
};

export const formatCurrency = (amount: number, currency: string): string => {
  const locale = currencyLocales[currency] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};
