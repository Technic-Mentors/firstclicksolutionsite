import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shopApi } from '../api/client';

function normalizeServerItem(item) {
  return {
    variantId: item.variant_id,
    quantity: item.quantity,
    productId: item.product_id,
    productName: item.product_name,
    productSlug: item.product_slug,
    spec: item.spec,
    conditionGrade: item.condition_grade,
    unitPrice: Number(item.unit_price),
    primaryImage: item.primary_image,
    stockQuantity: item.stock_quantity,
    isActive: item.is_active,
  };
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      mode: 'guest', // 'guest' (localStorage) | 'server' (persisted cart_items table)
      _syncPromise: null,

      /**
       * Merges any guest-mode items into the account (a no-op if already server-mode or empty)
       * and reloads from the server. Concurrent callers share one in-flight sync instead of
       * racing each other — important because both the login/register flow and the app's
       * "customer became available" effect call into this independently on auth success.
       */
      async _syncWithServer() {
        const guestItems = get().mode === 'guest' ? get().items : [];
        if (guestItems.length > 0) {
          await shopApi.post('/cart/merge', {
            items: guestItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          });
        }
        const { data } = await shopApi.get('/cart');
        set({ items: data.data.map(normalizeServerItem), mode: 'server' });
      },

      /** Call once after login/register succeeds, or on app load if already authenticated. */
      loadServerCart() {
        if (!get()._syncPromise) {
          const promise = get()
            ._syncWithServer()
            .finally(() => set({ _syncPromise: null }));
          set({ _syncPromise: promise });
        }
        return get()._syncPromise;
      },

      /** Call right after login/register — pushes the guest cart into the account, then reloads from server. */
      mergeGuestCartIntoServer() {
        return get().loadServerCart();
      },

      /** Call on logout — drops the server-synced cart from local state, back to an empty guest cart. */
      resetToGuest() {
        set({ items: [], mode: 'guest' });
      },

      async addItem(variantSnapshot, quantity = 1) {
        if (get().mode === 'server') {
          const existing = get().items.find((item) => item.variantId === variantSnapshot.variantId);
          const { data } = await shopApi.post('/cart/items', {
            variantId: variantSnapshot.variantId,
            quantity: (existing?.quantity || 0) + quantity,
          });
          set({ items: data.data.map(normalizeServerItem) });
          return;
        }

        set((state) => {
          const stock = variantSnapshot.stockQuantity ?? Infinity;
          const existing = state.items.find((item) => item.variantId === variantSnapshot.variantId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === variantSnapshot.variantId
                  ? { ...item, ...variantSnapshot, quantity: Math.min(item.quantity + quantity, stock) }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...variantSnapshot, quantity: Math.min(quantity, stock) }] };
        });
      },

      async updateQuantity(variantId, quantity) {
        if (get().mode === 'server') {
          const { data } = await shopApi.post('/cart/items', { variantId, quantity });
          set({ items: data.data.map(normalizeServerItem) });
          return;
        }
        set((state) => ({
          items: state.items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
        }));
      },

      async removeItem(variantId) {
        if (get().mode === 'server') {
          const { data } = await shopApi.delete(`/cart/items/${variantId}`);
          set({ items: data.data.map(normalizeServerItem) });
          return;
        }
        set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) }));
      },

      clearLocal() {
        set({ items: [] });
      },
    }),
    {
      name: 'ma-universal-cart',
      partialize: (state) =>
        state.mode === 'guest' ? { items: state.items, mode: state.mode } : { items: [], mode: 'guest' },
    },
  ),
);

export function cartSubtotal(items) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function cartItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
