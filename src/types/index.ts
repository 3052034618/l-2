export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  image: string;
  expireDate?: string;
  salesVolume?: number;
}

export interface StoreData {
  id: string;
  name: string;
  address: string;
  todaySales: number;
  yesterdaySales: number;
  todayTraffic: number;
  yesterdayTraffic: number;
  completionRate: number;
  rank?: number;
}

export interface Task {
  id: string;
  title: string;
  type: 'promotion' | 'inspection' | 'training' | 'other';
  description: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress?: number;
  items?: TaskItem[];
  createTime: string;
}

export interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface DisplayRecord {
  id: string;
  shelfName: string;
  images: string[];
  status: 'normal' | 'abnormal';
  remark?: string;
  createTime: string;
}

export interface StockRecord {
  id: string;
  productId: string;
  productName: string;
  type: 'loss' | 'profit';
  quantity: number;
  reason: string;
  createTime: string;
}

export interface SalesTrend {
  date: string;
  sales: number;
  volume: number;
}

export interface DashboardData {
  todaySales: number;
  yesterdaySales: number;
  salesGrowth: number;
  todayTraffic: number;
  yesterdayTraffic: number;
  trafficGrowth: number;
  outOfStockCount: number;
  nearExpiryCount: number;
  pendingTasks: number;
  todayInspections: number;
}

export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  color: string;
  page: string;
}
