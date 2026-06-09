import { DashboardData, QuickAction, Product } from '@/types';

export const dashboardData: DashboardData = {
  todaySales: 12580.50,
  yesterdaySales: 10890.30,
  salesGrowth: 0.155,
  todayTraffic: 328,
  yesterdayTraffic: 295,
  trafficGrowth: 0.112,
  outOfStockCount: 12,
  nearExpiryCount: 8,
  pendingTasks: 5,
  todayInspections: 3
};

export const quickActions: QuickAction[] = [
  { id: '1', name: '扫码盘点', icon: 'scan', color: '#165dff', page: '/pages/inventory/index' },
  { id: '2', name: '补货申请', icon: 'cart', color: '#00b42a', page: '/pages/replenishment/index' },
  { id: '3', name: '陈列检查', icon: 'camera', color: '#ff7d00', page: '/pages/display/index' },
  { id: '4', name: '报损报溢', icon: 'report', color: '#722ed1', page: '/pages/loss-profit/index' }
];

export const outOfStockProducts: Product[] = [
  {
    id: '1',
    name: '康师傅红烧牛肉面',
    barcode: '6901234567890',
    category: '方便食品',
    price: 4.5,
    stock: 0,
    minStock: 20,
    unit: '袋',
    image: 'https://picsum.photos/id/292/200/200'
  },
  {
    id: '2',
    name: '农夫山泉550ml',
    barcode: '6901234567891',
    category: '饮料',
    price: 2.0,
    stock: 2,
    minStock: 30,
    unit: '瓶',
    image: 'https://picsum.photos/id/431/200/200'
  },
  {
    id: '3',
    name: '乐事原味薯片',
    barcode: '6901234567892',
    category: '休闲零食',
    price: 8.5,
    stock: 1,
    minStock: 15,
    unit: '袋',
    image: 'https://picsum.photos/id/312/200/200'
  },
  {
    id: '4',
    name: '伊利纯牛奶250ml',
    barcode: '6901234567893',
    category: '乳制品',
    price: 3.5,
    stock: 3,
    minStock: 25,
    unit: '盒',
    image: 'https://picsum.photos/id/401/200/200'
  }
];

export const nearExpiryProducts: Product[] = [
  {
    id: '5',
    name: '蒙牛酸奶100g',
    barcode: '6901234567894',
    category: '乳制品',
    price: 5.0,
    stock: 15,
    minStock: 10,
    unit: '杯',
    image: 'https://picsum.photos/id/401/200/200',
    expireDate: '2026-06-15'
  },
  {
    id: '6',
    name: '桃李面包',
    barcode: '6901234567895',
    category: '烘焙食品',
    price: 6.5,
    stock: 8,
    minStock: 10,
    unit: '个',
    image: 'https://picsum.photos/id/580/200/200',
    expireDate: '2026-06-12'
  },
  {
    id: '7',
    name: '双汇火腿肠',
    barcode: '6901234567896',
    category: '肉制食品',
    price: 3.0,
    stock: 20,
    minStock: 15,
    unit: '根',
    image: 'https://picsum.photos/id/625/200/200',
    expireDate: '2026-06-18'
  }
];

export const salesTrendData = [
  { date: '06-04', sales: 9800 },
  { date: '06-05', sales: 10500 },
  { date: '06-06', sales: 11200 },
  { date: '06-07', sales: 9600 },
  { date: '06-08', sales: 10800 },
  { date: '06-09', sales: 10890 },
  { date: '06-10', sales: 12580 }
];
