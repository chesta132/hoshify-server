import { RequireAtLeastOne } from "@/types";

const currencyLocales: Record<string, Intl.LocalesArgument> = {
  // Asia
  IDR: "id-ID",
  JPY: "ja-JP",
  CNY: "zh-CN",
  KRW: "ko-KR",
  INR: "en-IN",
  THB: "th-TH",
  VND: "vi-VN",

  // Europe
  EUR: "de-DE",
  GBP: "en-GB",
  CHF: "de-CH",
  RUB: "ru-RU",
  SEK: "sv-SE",
  NOK: "nb-NO",
  DKK: "da-DK",

  // America
  USD: "en-US",
  CAD: "en-CA",
  MXN: "es-MX",
  BRL: "pt-BR",
  ARS: "es-AR",

  // Oceania
  AUD: "en-AU",
  NZD: "en-NZ",
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
