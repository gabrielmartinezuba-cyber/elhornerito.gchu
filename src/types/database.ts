// ────────────────────────────────────────────────────────────────────────────
// Tipos de dominio
// ────────────────────────────────────────────────────────────────────────────

export type Category = 'Dulce' | 'Salado';

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled';

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

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_status: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  mp_merchant_order_id: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string | null;
  quantity: number;
  unit_price: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Database schema — compatible con supabase-js v2.46 / ssr v0.5
// ────────────────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          image_urls?: string[] | null;
          category: Category;
          is_published?: boolean;
          in_stock?: boolean;
          stock_quantity?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          image_urls?: string[] | null;
          category?: Category;
          is_published?: boolean;
          in_stock?: boolean;
          stock_quantity?: number;
        };
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          created_at?: string;
          customer_name: string;
          customer_email?: string;
          customer_phone?: string | null;
          total_amount: number;
          status?: OrderStatus;
          payment_method?: string | null;
          payment_status?: string | null;
          mp_preference_id?: string | null;
          mp_payment_id?: string | null;
          mp_merchant_order_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          total_amount?: number;
          status?: OrderStatus;
          payment_method?: string | null;
          payment_status?: string | null;
          mp_preference_id?: string | null;
          mp_payment_id?: string | null;
          mp_merchant_order_id?: string | null;
        };
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name?: string | null;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string | null;
          quantity?: number;
          unit_price?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      category: Category;
      order_status: OrderStatus;
    };
  };
}
