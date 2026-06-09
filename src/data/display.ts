import { DisplayRecord } from '@/types';

export const shelfList = [
  { id: '1', name: '饮料区A面', category: '饮料', status: 'checked', lastCheck: '2026-06-10 09:30' },
  { id: '2', name: '饮料区B面', category: '饮料', status: 'pending', lastCheck: '2026-06-09 15:00' },
  { id: '3', name: '零食区A面', category: '休闲零食', status: 'checked', lastCheck: '2026-06-10 10:15' },
  { id: '4', name: '零食区B面', category: '休闲零食', status: 'abnormal', lastCheck: '2026-06-10 08:45' },
  { id: '5', name: '乳制品区', category: '乳制品', status: 'pending', lastCheck: '2026-06-09 16:30' },
  { id: '6', name: '方便食品区', category: '方便食品', status: 'checked', lastCheck: '2026-06-10 09:00' }
];

export const displayRecords: DisplayRecord[] = [
  {
    id: '1',
    shelfName: '饮料区A面',
    images: [
      'https://picsum.photos/id/326/400/300',
      'https://picsum.photos/id/431/400/300'
    ],
    status: 'normal',
    remark: '陈列整齐，价签完整',
    createTime: '2026-06-10 09:30:00'
  },
  {
    id: '2',
    shelfName: '零食区B面',
    images: [
      'https://picsum.photos/id/312/400/300'
    ],
    status: 'abnormal',
    remark: '部分商品缺货，需补货',
    createTime: '2026-06-10 08:45:00'
  },
  {
    id: '3',
    shelfName: '方便食品区',
    images: [
      'https://picsum.photos/id/292/400/300',
      'https://picsum.photos/id/625/400/300'
    ],
    status: 'normal',
    remark: '陈列良好',
    createTime: '2026-06-10 09:00:00'
  }
];

export const checkItems = [
  { id: '1', name: '商品陈列整齐', required: true },
  { id: '2', name: '价签清晰完整', required: true },
  { id: '3', name: '商品正面朝外', required: true },
  { id: '4', name: '先进先出原则', required: true },
  { id: '5', name: '促销标识正确', required: false },
  { id: '6', name: '货架清洁卫生', required: true }
];
