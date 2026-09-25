// Re-export database types for convenience
export type {
  ProductCategory,
  ProductRow,
  ProductImage,
  ProductWithRelations,
} from "./database";

// Price type alias
export type Price = number;

// Cart item - stored in localStorage
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: Price;
  pcs: number;
  imageUrl?: string;
  quantity: number;
}
