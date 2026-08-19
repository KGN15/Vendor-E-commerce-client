// types/index.ts

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  authProvider: string;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IProductVariant {
  _id: string;
  sku: string;
  barcode?: string;
  name?: string;
  price: number;
  stock: number;
  design: string;
  size?: string;
  color?: string;
  isActive: boolean
}

export interface IProduct {
  _id: string;
  stock: number;
  name: string;
  images: string;
  slug: string;
  description?: string;
  fullDescription?: string;
  basePrice: number;
  compareAtPrice?: number;
  gallery: string[];
  thumbnail?: string;
  highlights?: string[];
  category?: any;
  variants?: IProductVariant[];
  isActive?: boolean;
  averageRating?: number;
  reviewCount?: number;
  price?: {
    min: number;
    max: number;
  };
}

export interface ICartItem {
  productId: string;
  variantId: string;
  product: IProduct;
  variant: IProductVariant;
  quantity: number;
}