// The shapes the shop's API returns. Money arrives as text, for example "3500.00".

export type CategoryRef = { id: number; name: string; slug: string };

export type Category = CategoryRef & {
  parent: string | null;
  image: string | null;
};

export type BrandSummary = { id: number; name: string; slug: string };

export type BrandPhone = { id: number; name: string; slug: string; series: string };

export type Brand = BrandSummary & { phones: BrandPhone[] };

export type Phone = {
  id: number;
  name: string;
  full_name: string;
  slug: string;
  series: string;
  brand: BrandSummary;
};

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  category: CategoryRef;
  accessory_brand: string;
  price_from: string;
  image: string | null;
  in_stock: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_universal: boolean;
};

export type ProductVariant = {
  id: number;
  option: string;
  price: string;
  in_stock: boolean;
  low_stock: boolean;
  stock_left: number | null;
};

export type ProductImage = { url: string; alt_text: string };

export type ProductDetail = ProductSummary & {
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
  compatible_phones: { id: number; name: string; slug: string }[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type HomeData = {
  trending: ProductSummary[];
  new_arrivals: ProductSummary[];
  categories: Category[];
  brands: BrandSummary[];
};

export type StoreInfo = {
  name: string;
  currency: string;
  pickup_enabled: boolean;
  pickup_address: string;
  max_qty_per_line: number;
};



export type DeliveryZone = {
  id: number;
  name: string;
  slug: string;
  fee: string;
  eta_note: string;
  allows_cod: boolean;
};

export type CartIssue = {
  variant_id: number;
  product_name: string | null;
  option: string;
  code: string;
  message: string;
  available?: number;
};

export type CartLine = {
  variant_id: number;
  product_name: string;
  product_slug: string;
  option: string;
  image: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
  in_stock: boolean;
};

export type CartQuote = {
  lines: CartLine[];
  issues: CartIssue[];
  fulfilment: "delivery" | "pickup";
  zone: string | null;
  subtotal: string;
  delivery_fee: string | null;
  total: string | null;
  can_checkout: boolean;
  cod_available: boolean;
  cod_max_total: string;
};

export type OrderItem = {
  product_name: string;
  option: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type OrderDetail = {
  number: string;
  status: string;
  status_label: string;
  paid: boolean;
  handover_code: string | null;
  handover_qr: string | null;
  fulfilment: "delivery" | "pickup";
  payment_method: "online" | "cod";
  customer_name: string;
  zone: { name: string; slug: string } | null;
  address: string;
  landmark: string;
  pickup_address: string | null;
  note: string;
  subtotal: string;
  delivery_fee: string;
  total: string;
  items: OrderItem[];
  created_at: string;
};

export type OrderCreated = OrderDetail & { tracking_token: string };