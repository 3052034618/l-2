import { create } from 'zustand';
import { useEffect } from 'react';
import { loadPersistState, savePersistState } from '@/utils/persist';

const PERSIST_KEY = 'replenishment_store';

export interface ReplenishmentItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface ReplenishmentOrder {
  id: string;
  items: ReplenishmentItem[];
  totalQuantity: number;
  totalAmount: number;
  remark: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createTime: string;
}

interface ReplenishmentState {
  orders: ReplenishmentOrder[];
  _initialized: boolean;

  createOrder: (items: ReplenishmentItem[], remark: string) => void;
  getOrderById: (id: string) => ReplenishmentOrder | undefined;
  _persist: () => void;
}

const defaultOrders: ReplenishmentOrder[] = [
  {
    id: 'order_001',
    items: [
      { productId: '1', productName: '康师傅红烧牛肉面', quantity: 30, unit: '袋', price: 4.5 },
      { productId: '2', productName: '农夫山泉550ml', quantity: 50, unit: '瓶', price: 2.0 }
    ],
    totalQuantity: 80,
    totalAmount: 235,
    remark: '周末促销备货',
    status: 'pending',
    createTime: '2026-06-09 14:30:00'
  },
  {
    id: 'order_002',
    items: [
      { productId: '3', productName: '乐事原味薯片', quantity: 20, unit: '袋', price: 8.5 }
    ],
    totalQuantity: 20,
    totalAmount: 170,
    remark: '补货',
    status: 'approved',
    createTime: '2026-06-08 10:00:00'
  }
];

const defaultState = {
  orders: defaultOrders,
  _initialized: false
};

export const useReplenishmentStore = create<ReplenishmentState>((set, get) => ({
  ...defaultState,

  createOrder: (items, remark) => {
    console.log('[ReplenishmentStore] 创建补货单:', items.length, remark);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const newOrder: ReplenishmentOrder = {
      id: `order_${Date.now()}`,
      items,
      totalQuantity,
      totalAmount,
      remark,
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    };

    set(state => ({
      orders: [newOrder, ...state.orders]
    }));
    get()._persist();
  },

  getOrderById: (id) => {
    return get().orders.find(o => o.id === id);
  },

  _persist: () => {
    const { orders } = get();
    savePersistState(PERSIST_KEY, { orders });
  }
}));

export function useReplenishmentInit() {
  useEffect(() => {
    const stored = loadPersistState<{
      orders: ReplenishmentOrder[];
    } | null>(PERSIST_KEY, null);

    if (stored) {
      console.log('[ReplenishmentStore] 从本地存储恢复数据');
      useReplenishmentStore.setState({
        orders: stored.orders,
        _initialized: true
      });
    } else {
      useReplenishmentStore.setState({ _initialized: true });
    }
  }, []);
}
