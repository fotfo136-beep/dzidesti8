import { CompanySettings } from "./types";

export const defaultCompanySettings: CompanySettings = {
  name: "Estim8 Ghana",
  tagline: "Precision Estimations for Quality Construction",
  phone: "+233 XX XXX XXXX",
  email: "info@estim8gh.com",
  address: "Accra, Ghana",
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `QT-${year}-${num}`;
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `RC-${year}-${num}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function numberToWords(num: number): string {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero Ghana Cedis";

  const convertHundreds = (n: number): string => {
    if (n < 20) return units[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
    return (
      units[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " and " + convertHundreds(n % 100) : "")
    );
  };

  const ghanaCedis = convertHundreds(Math.floor(num));
  const pesewasInt = Math.round((num - Math.floor(num)) * 100);
  const pesewas = convertHundreds(pesewasInt);

  return `${ghanaCedis} Ghana Cedis${pesewasInt > 0 ? ` and ${pesewas} Pesewas` : " Only"}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const messageEncoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${messageEncoded}`;
}
