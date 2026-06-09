import { create } from 'zustand';
import { Product, StockRecord, SalesTrend } from '@/types';
import { inventoryList, stockRecords, salesTrend, lowStockSettings } from '@/data/inventory';

interface InventoryState {
  products: Product[];
  stockRecords: StockRecord[];
  lowStockSettings: {
    defaultMinStock: number;
    notifyEnabled: boolean;
    notifyTime: string;
    categories: { id: string; name: string; minStock: number }[];
  };
  salesTrend: SalesTrend[];

  updateStock: (productId: string, actualStock: number) => void;
  addStockRecord: (record: Omit<StockRecord, 'id' | 'createTime'>) => void;
  updateMinStock: (categoryId: string, minStock: number) => void;
  updateDefaultMinStock: (minStock: number) => void;
  updateNotifySetting: (enabled: boolean, time: string) => void;
  getProductById: (id: string) => Product | undefined;
  getStats: () => { total: number; low: number; out: number; near: number };
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: inventoryList,
  stockRecords: stockRecords,
  lowStockSettings: lowStockSettings,
  salesTrend: salesTrend,

  updateStock: (productId, actualStock) => {
    console.log('[InventoryStore] 更新库存:', productId, actualStock);
    set(state => {
      const product = state.products.find(p => p.id === productId);
      if (!product) return state;

      const diff = actualStock - product.stock;
      const newProducts = state.products.map(p =>
        p.id === productId ? { ...p, stock: actualStock } : p
      );

      if (diff !== 0) {
        const record: StockRecord = {
          id: `record_${Date.now()}`,
          productId,
          productName: product.name,
          type: diff > 0 ? 'profit' : 'loss',
          quantity: Math.abs(diff),
          reason: '盘点调整',
          createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        };
        return {
          products: newProducts,
          stockRecords: [record, ...state.stockRecords]
        };
      }

      return { products: newProducts };
    });
  },

  addStockRecord: (record) => {
    console.log('[InventoryStore] 添加库存记录:', record);
    set(state => {
      const newRecord: StockRecord = {
        ...record,
        id: `record_${Date.now()}`,
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      };

      const product = state.products.find(p => p.id === record.productId);
      let newProducts = state.products;
      if (product) {
        const stockChange = record.type === 'profit' ? record.quantity : -record.quantity;
        newProducts = state.products.map(p =>
          p.id === record.productId
            ? { ...p, stock: Math.max(0, p.stock + stockChange) }
            : p
        );
      }

      return {
        stockRecords: [newRecord, ...state.stockRecords],
        products: newProducts
      };
    });
  },

  updateMinStock: (categoryId, minStock) => {
    console.log('[InventoryStore] 更新分类最低库存:', categoryId, minStock);
    set(state => ({
      lowStockSettings: {
        ...state.lowStockSettings,
        categories: state.lowStockSettings.categories.map(c =>
          c.id === categoryId ? { ...c, minStock } : c
        )
      },
      products: state.products.map(p =>
        p.categoryId === categoryId ? { ...p, minStock } : p
      )
    }));
  },

  updateDefaultMinStock: (minStock) => {
    console.log('[InventoryStore] 更新默认最低库存:', minStock);
    set(state => ({
      lowStockSettings: {
        ...state.lowStockSettings,
        defaultMinStock: minStock
      }
    }));
  },

  updateNotifySetting: (enabled, time) => {
    console.log('[InventoryStore] 更新通知设置:', enabled, time);
    set(state => ({
      lowStockSettings: {
        ...state.lowStockSettings,
        notifyEnabled: enabled,
        notifyTime: time
      }
    }));
  },

  getProductById: (id) => {
    return get().products.find(p => p.id === id);
  },

  getStats: () => {
    const { products } = get();
    const total = products.length;
    const low = products.filter(p => p.stock > 0 && p.stock < p.minStock).length;
    const out = products.filter(p => p.stock <= 0).length;
    const near = products.filter(p => p.expireDate).length;
    return { total, low, out, near };
  }
}));
