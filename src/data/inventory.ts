import { Product, StockRecord, SalesTrend } from '@/types';

export const inventoryList: Product[] = [
  {
    id: '1',
    name: '康师傅红烧牛肉面',
    barcode: '6901234567890',
    category: '方便食品',
    price: 4.5,
    stock: 0,
    minStock: 20,
    unit: '袋',
    image: 'https://picsum.photos/id/292/200/200',
    salesVolume: 156
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
    image: 'https://picsum.photos/id/431/200/200',
    salesVolume: 289
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
    image: 'https://picsum.photos/id/312/200/200',
    salesVolume: 98
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
    image: 'https://picsum.photos/id/401/200/200',
    salesVolume: 203
  },
  {
    id: '8',
    name: '可口可乐330ml',
    barcode: '6901234567897',
    category: '饮料',
    price: 3.0,
    stock: 45,
    minStock: 20,
    unit: '罐',
    image: 'https://picsum.photos/id/326/200/200',
    salesVolume: 178
  },
  {
    id: '9',
    name: '奥利奥夹心饼干',
    barcode: '6901234567898',
    category: '休闲零食',
    price: 12.5,
    stock: 32,
    minStock: 15,
    unit: '盒',
    image: 'https://picsum.photos/id/570/200/200',
    salesVolume: 87
  },
  {
    id: '10',
    name: '德芙巧克力',
    barcode: '6901234567899',
    category: '休闲零食',
    price: 15.0,
    stock: 28,
    minStock: 10,
    unit: '块',
    image: 'https://picsum.photos/id/1080/200/200',
    salesVolume: 65
  },
  {
    id: '11',
    name: '怡宝矿泉水555ml',
    barcode: '6901234567900',
    category: '饮料',
    price: 2.0,
    stock: 68,
    minStock: 30,
    unit: '瓶',
    image: 'https://picsum.photos/id/431/200/200',
    salesVolume: 234
  },
  {
    id: '12',
    name: '旺旺雪饼',
    barcode: '6901234567901',
    category: '休闲零食',
    price: 8.0,
    stock: 22,
    minStock: 15,
    unit: '袋',
    image: 'https://picsum.photos/id/580/200/200',
    salesVolume: 112
  },
  {
    id: '13',
    name: '康师傅冰红茶500ml',
    barcode: '6901234567902',
    category: '饮料',
    price: 3.5,
    stock: 55,
    minStock: 25,
    unit: '瓶',
    image: 'https://picsum.photos/id/326/200/200',
    salesVolume: 167
  }
];

export const stockRecords: StockRecord[] = [
  {
    id: '1',
    productId: '1',
    productName: '康师傅红烧牛肉面',
    type: 'loss',
    quantity: 2,
    reason: '包装破损',
    createTime: '2026-06-10 10:30:00'
  },
  {
    id: '2',
    productId: '5',
    productName: '蒙牛酸奶100g',
    type: 'loss',
    quantity: 3,
    reason: '临期过期',
    createTime: '2026-06-09 14:20:00'
  },
  {
    id: '3',
    productId: '8',
    productName: '可口可乐330ml',
    type: 'profit',
    quantity: 1,
    reason: '盘点盈余',
    createTime: '2026-06-08 16:45:00'
  }
];

export const salesTrend: SalesTrend[] = [
  { date: '06-04', sales: 450, volume: 156 },
  { date: '06-05', sales: 520, volume: 178 },
  { date: '06-06', sales: 480, volume: 165 },
  { date: '06-07', sales: 380, volume: 132 },
  { date: '06-08', sales: 560, volume: 189 },
  { date: '06-09', sales: 620, volume: 210 },
  { date: '06-10', sales: 702, volume: 235 }
];

export const lowStockSettings = {
  defaultMinStock: 10,
  notifyEnabled: true,
  notifyTime: '09:00',
  categories: [
    { id: '1', name: '饮料', minStock: 30 },
    { id: '2', name: '方便食品', minStock: 20 },
    { id: '3', name: '休闲零食', minStock: 15 },
    { id: '4', name: '乳制品', minStock: 25 }
  ]
};
