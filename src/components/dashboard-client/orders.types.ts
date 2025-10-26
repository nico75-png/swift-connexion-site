export type OrderStatus = "delivered" | "pending" | "cancelled" | "in_transit";

export interface OrderItem {
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface OrderPayment {
  subtotal?: number;
  fees?: number;
  method?: string;
}

export interface OrderDelivery {
  address?: string;
  expected_date?: string;
  status?: string;
}

export interface OrderDriver {
  id?: string;
  name?: string;
  phone?: string;
  vehicle?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  created_at: string;
  updated_at?: string;
  status: OrderStatus;
  status_label?: string;
  source?: string;
  driver?: OrderDriver;
  delivery?: OrderDelivery;
  items: OrderItem[];
  payment?: OrderPayment;
  total_amount: number;
  currency: string;
}
