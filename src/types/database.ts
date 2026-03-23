export type Category = 'Dulce' | 'Salado';

export interface Product {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_urls: string[] | null;
  category: Category;
  is_published: boolean;
  in_stock: boolean;
  stock_quantity: number;
}

export interface ProductInsert extends Omit<Product, 'id' | 'created_at'> {}

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null; // NUEVO
  total_amount: number;
  status: OrderStatus;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  mp_merchant_order_id: string | null;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product | null })[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // desnormalizado para historial
  quantity: number;
  unit_price: number;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
    };
  };
}
