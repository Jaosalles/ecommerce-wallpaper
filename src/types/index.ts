// ============================================
// USER TYPES
// ============================================

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};

// ============================================
// PRODUCT TYPES
// ============================================

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  resolutions: string[];
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'downloads'>;

export type ProductCategory = 'minimalist' | 'pastel' | 'dark' | 'nature' | 'abstract' | 'custom';

export type ProductResolution = '540p' | '720p' | '1080p' | '1440p' | '4K';

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  resolution: string;
  createdAt: Date;
};

export type Order = {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  whatsappMessageId?: string;
  whatsappSentAt?: Date;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateOrderInput = {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    resolution: string;
  }[];
};

// ============================================
// CART TYPES
// ============================================

export type CartItem = {
  productId: string;
  product?: Product;
  quantity: number;
  resolution: ProductResolution;
  price: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ============================================
// WHATSAPP TYPES
// ============================================

export type WhatsAppMessage = {
  phoneNumber: string;
  message: string;
  orderId: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    resolution: string;
  }>;
};

// ============================================
// AUTH TYPES
// ============================================

export type JwtPayload = {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: Omit<User, 'password'>;
  token: string;
};
