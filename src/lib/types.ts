export type InvoiceStatus = 'payée' | 'envoyée' | 'brouillon' | 'en retard';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  reference: string;
  clientId: string; 
  customer: string; 
  salesman: string;
  amount: number;
  subtotal: number;
  taxAmount: number;
  date: string; 
  dueDate: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  items: InvoiceItem[];
}
