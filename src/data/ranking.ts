import { StoreData } from '@/types';

export const storeRanking: StoreData[] = [
  {
    id: '1',
    name: '朝阳路店',
    address: '北京市朝阳区朝阳路88号',
    todaySales: 15680.50,
    yesterdaySales: 14200.00,
    todayTraffic: 428,
    yesterdayTraffic: 395,
    completionRate: 0.95,
    rank: 1
  },
  {
    id: '2',
    name: '中关村店',
    address: '北京市海淀区中关村大街1号',
    todaySales: 14520.80,
    yesterdaySales: 13800.50,
    todayTraffic: 395,
    yesterdayTraffic: 372,
    completionRate: 0.89,
    rank: 2
  },
  {
    id: '3',
    name: '国贸店',
    address: '北京市朝阳区国贸大厦B座',
    todaySales: 13890.00,
    yesterdaySales: 12500.30,
    todayTraffic: 368,
    yesterdayTraffic: 340,
    completionRate: 0.85,
    rank: 3
  },
  {
    id: '4',
    name: '望京店',
    address: '北京市朝阳区望京soho',
    todaySales: 12580.50,
    yesterdaySales: 10890.30,
    todayTraffic: 328,
    yesterdayTraffic: 295,
    completionRate: 0.78,
    rank: 4
  },
  {
    id: '5',
    name: '西直门',
    address: '北京市西城区西直门外大街',
    todaySales: 11200.60,
    yesterdaySales: 10500.80,
    todayTraffic: 298,
    yesterdayTraffic: 285,
    completionRate: 0.72,
    rank: 5
  },
  {
    id: '6',
    name: '五道口店',
    address: '北京市海淀区五道口',
    todaySales: 10680.20,
    yesterdaySales: 9800.50,
    todayTraffic: 275,
    yesterdayTraffic: 260,
    completionRate: 0.68,
    rank: 6
  },
  {
    id: '7',
    name: '三里屯店',
    address: '北京市朝阳区三里屯',
    todaySales: 9850.40,
    yesterdaySales: 9200.00,
    todayTraffic: 258,
    yesterdayTraffic: 245,
    completionRate: 0.62,
    rank: 7
  },
  {
    id: '8',
    name: '双榆树店',
    address: '北京市海淀区双榆树',
    todaySales: 8960.30,
    yesterdaySales: 8500.70,
    todayTraffic: 235,
    yesterdayTraffic: 228,
    completionRate: 0.56,
    rank: 8
  }
];

export const inspectionRecords = [
  {
    id: '1',
    storeName: '望京店',
    inspector: '张店长',
    date: '2026-06-10',
    score: 88,
    items: [
      { name: '商品陈列', score: 90 },
      { name: '库存管理', score: 85 },
      { name: '卫生情况', score: 92 },
      { name: '服务质量', score: 88 },
      { name: '安全管理', score: 85 }
    ],
    status: 'completed'
  },
  {
    id: '2',
    storeName: '望京店',
    inspector: '李督导',
    date: '2026-06-05',
    score: 82,
    items: [
      { name: '商品陈列', score: 80 },
      { name: '库存管理', score: 85 },
      { name: '卫生情况', score: 88 },
      { name: '服务质量', score: 82 },
      { name: '安全管理', score: 75 }
    ],
    status: 'completed'
  },
  {
    id: '3',
    storeName: '望京店',
    inspector: '张店长',
    date: '2026-05-28',
    score: 90,
    items: [
      { name: '商品陈列', score: 92 },
      { name: '库存管理', score: 88 },
      { name: '卫生情况', score: 90 },
      { name: '服务质量', score: 92 },
      { name: '安全管理', score: 88 }
    ],
    status: 'completed'
  }
];
