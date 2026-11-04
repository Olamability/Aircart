
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./sanity.types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreState {
  // Cart
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;

  // Cart calculations
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getDiscountAmount: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];

  // Favourites
  favoriteProduct: Product[];
  addToFavorite: (product: Product) => Promise<void>;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;

  // Persistence hydration
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const getValidStock = (product: Product): number => {
  const stock = product.stock;

  return typeof stock === "number" && Number.isFinite(stock) && stock >= 0
    ? stock
    : 0;
};

const getValidPrice = (product: Product): number => {
  const price = product.price;

  return typeof price === "number" && Number.isFinite(price) && price >= 0
    ? price
    : 0;
};

const getValidDiscount = (product: Product): number => {
  const discount = product.discount;

  return typeof discount === "number" &&
    Number.isFinite(discount) &&
    discount >= 0
    ? Math.min(discount, 100)
    : 0;
};

const getDiscountedPrice = (product: Product): number => {
  const price = getValidPrice(product);
  const discount = getValidDiscount(product);

  return price * (1 - discount / 100);
};

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteProduct: [],
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      // Add one item, respecting available stock
      addItem: (product) =>
        set((state) => {
          if (!product?._id || getValidStock(product) <= 0) {
            return state;
          }

          const existingItem = state.items.find(
            (item) => item.product._id === product._id,
          );

          const currentQuantity = existingItem?.quantity ?? 0;
          const availableStock = getValidStock(product);

          if (currentQuantity >= availableStock) {
            return state;
          }

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? {
                    ...item,
                    product,
                    quantity: item.quantity + 1,
                  }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          };
        }),

      // Decrease quantity by one; remove item when quantity reaches zero
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product._id === productId) {
              if (item.quantity > 1) {
                acc.push({
                  ...item,
                  quantity: item.quantity - 1,
                });
              }
            } else {
              acc.push(item);
            }

            return acc;
          }, [] as CartItem[]),
        })),

      // Remove a product completely
      deleteCartProduct: (productId) =>
        set((state) => ({
          items: state.items.filter(
            ({ product }) => product?._id !== productId,
          ),
        })),

      resetCart: () => set({ items: [] }),

      // Original total before product discounts
      getTotalPrice: () =>
        get().items.reduce(
          (total, item) =>
            total + getValidPrice(item.product) * item.quantity,
          0,
        ),

      // Actual product subtotal after product discounts
      getSubTotalPrice: () =>
        get().items.reduce(
          (total, item) =>
            total + getDiscountedPrice(item.product) * item.quantity,
          0,
        ),

      // Total savings from product discounts
      getDiscountAmount: () =>
        get().items.reduce((total, item) => {
          const originalPrice = getValidPrice(item.product);
          const discountedPrice = getDiscountedPrice(item.product);

          return (
            total +
            (originalPrice - discountedPrice) * item.quantity
          );
        }, 0),

      getItemCount: (productId) => {
        const item = get().items.find(
          (item) => item.product._id === productId,
        );

        return item?.quantity ?? 0;
      },

      getGroupedItems: () => get().items,

      // Toggle favourite status
      addToFavorite: (product) =>
        new Promise<void>((resolve) => {
          set((state) => {
            const isFavorite = state.favoriteProduct.some(
              (item) => item._id === product._id,
            );

            return {
              favoriteProduct: isFavorite
                ? state.favoriteProduct.filter(
                  (item) => item._id !== product._id,
                )
                : [...state.favoriteProduct, { ...product }],
            };
          });

          resolve();
        }),

      removeFromFavorite: (productId) =>
        set((state) => ({
          favoriteProduct: state.favoriteProduct.filter(
            (item) => item?._id !== productId,
          ),
        })),

      resetFavorite: () =>
        set({
          favoriteProduct: [],
        }),
    }),

    {
      name: "spaazr-store",

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useStore;
