import { RequireAtLeastOne } from "@/types/types";

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
  }).format(amount === 0 ? 0 : amount);
};

export const currencyFields: CurrencyFields[] = ["amount", "income", "outcome", "total"];
export type CurrencyFields = "amount" | "income" | "outcome" | "total";
export type ModifiedCurrency<T extends RequireAtLeastOne<Record<CurrencyFields, any>>> = ConditionalField<T, CurrencyFields, CurrencyFields, string>;
