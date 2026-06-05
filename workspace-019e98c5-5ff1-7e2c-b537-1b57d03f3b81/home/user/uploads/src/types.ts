export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  businessName?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
  date: string;
  expiryDate: string;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  quoteId?: string;
  quoteNumber?: string;
  client: Client;
  date: string;
  amount: number;
  amountWords: string;
  paymentMethod: "cash" | "mobile_money" | "bank_transfer" | "cheque" | "other";
  reference?: string;
  receivedFrom: string;
  description: string;
  balance?: number;
  previousPayments?: number;
  notes?: string;
  status: "draft" | "issued" | "cancelled";
}

export interface CompanySettings {
  name: string;
  tagline?: string;
  phone: string;
  email?: string;
  address: string;
  logo?: string;
}

export interface AppSettings extends CompanySettings {
  lastUpdated: string;
}