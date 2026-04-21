export type Category = {
  id: number;
  name: string;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  image_url: string | null;
  created_at: string;
  categories?: Category;
};

export type Transaction = {
  id: string;
  customer_name: string;
  total_price: number;
  payment_method: 'CASH' | 'QRIS';
  created_at: string;
  transaction_items?: TransactionItem[];
};

export type TransactionItem = {
  id: number;
  transaction_id: string;
  product_id: number;
  quantity: number;
  subtotal: number;
  products?: Product;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type DailySalesData = {
  date: string;
  total: number;
  count: number;
};
