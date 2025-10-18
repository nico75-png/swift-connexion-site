export type ClientInvoiceStatus = "Payée" | "En attente de paiement";

export interface ClientInvoiceSnapshot {
  id: string;
  period: string;
  orders: number;
  amount: number;
  status: ClientInvoiceStatus;
  statusColor: "success" | "warning";
  date: string;
  dueDate: string;
}

const CLIENT_INVOICE_DATA: ClientInvoiceSnapshot[] = [
  {
    id: "FAC-2025-001",
    period: "Janvier 2025",
    orders: 12,
    amount: 1325.6,
    status: "Payée",
    statusColor: "success",
    date: "05/02/2025",
    dueDate: "20/02/2025",
  },
  {
    id: "FAC-2025-002",
    period: "Février 2025",
    orders: 9,
    amount: 980.4,
    status: "En attente de paiement",
    statusColor: "warning",
    date: "05/03/2025",
    dueDate: "20/03/2025",
  },
  {
    id: "FAC-2024-011",
    period: "Novembre 2024",
    orders: 14,
    amount: 1542.99,
    status: "Payée",
    statusColor: "success",
    date: "05/12/2024",
    dueDate: "20/12/2024",
  },
];

export const listClientInvoices = (): ClientInvoiceSnapshot[] => CLIENT_INVOICE_DATA.map((invoice) => ({ ...invoice }));

export const getClientInvoiceById = (invoiceId: string): ClientInvoiceSnapshot | undefined =>
  CLIENT_INVOICE_DATA.find((invoice) => invoice.id === invoiceId);
