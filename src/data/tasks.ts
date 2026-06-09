import { Task } from '@/types';

export const taskList: Task[] = [
  {
    id: '1',
    title: '夏季饮料促销活动',
    type: 'promotion',
    description: '配合总部夏季饮料促销活动，做好陈列和价格调整工作，确保活动期间销量提升20%。',
    deadline: '2026-06-30',
    status: 'in_progress',
    progress: 60,
    createTime: '2026-06-08 09:00:00',
    items: [
      { id: '1-1', name: '调整饮料区陈列', completed: true },
      { id: '1-2', name: '更换促销价签', completed: true },
      { id: '1-3', name: '设置堆头展示', completed: true },
      { id: '1-4', name: '员工培训', completed: false },
      { id: '1-5', name: '活动效果评估', completed: false }
    ]
  },
  {
    id: '2',
    title: '端午节日商品陈列',
    type: 'promotion',
    description: '端午节前完成粽子、咸鸭蛋等节日商品的陈列和备货工作。',
    deadline: '2026-06-20',
    status: 'in_progress',
    progress: 40,
    createTime: '2026-06-09 10:30:00',
    items: [
      { id: '2-1', name: '粽子到货验收', completed: true },
      { id: '2-2', name: '节日专区陈列', completed: false },
      { id: '2-3', name: '价格调整', completed: false },
      { id: '2-4', name: '宣传海报张贴', completed: false }
    ]
  },
  {
    id: '3',
    title: '本月库存盘点',
    type: 'inspection',
    description: '完成本月全店库存盘点工作，确保账实相符。',
    deadline: '2026-06-25',
    status: 'pending',
    progress: 0,
    createTime: '2026-06-07 14:00:00',
    items: [
      { id: '3-1', name: '食品类盘点', completed: false },
      { id: '3-2', name: '饮料类盘点', completed: false },
      { id: '3-3', name: '日用品类盘点', completed: false },
      { id: '3-4', name: '盘点差异处理', completed: false }
    ]
  },
  {
    id: '4',
    title: '新员工服务规范培训',
    type: 'training',
    description: '组织新员工参加服务规范培训，提升服务质量。',
    deadline: '2026-06-15',
    status: 'completed',
    progress: 100,
    createTime: '2026-06-05 16:00:00',
    items: [
      { id: '4-1', name: '服务礼仪培训', completed: true },
      { id: '4-2', name: '收银操作培训', completed: true },
      { id: '4-3', name: '考核评估', completed: true }
    ]
  },
  {
    id: '5',
    title: '消防安全检查',
    type: 'other',
    description: '配合总部进行季度消防安全检查，消除安全隐患。',
    deadline: '2026-06-18',
    status: 'pending',
    progress: 0,
    createTime: '2026-06-10 08:00:00',
    items: [
      { id: '5-1', name: '消防器材检查', completed: false },
      { id: '5-2', name: '应急通道检查', completed: false },
      { id: '5-3', name: '电器安全检查', completed: false }
    ]
  }
];

export const messages = [
  {
    id: '1',
    type: 'system',
    title: '系统通知',
    content: '您有新的促销任务待处理，请及时查看。',
    time: '2026-06-10 09:00:00',
    read: false
  },
  {
    id: '2',
    type: 'alert',
    title: '库存预警',
    content: '共有12种商品库存不足，请及时补货。',
    time: '2026-06-10 08:30:00',
    read: false
  },
  {
    id: '3',
    type: 'system',
    title: '临期提醒',
    content: '有8种商品临期，请关注销售情况。',
    time: '2026-06-10 08:00:00',
    read: true
  },
  {
    id: '4',
    type: 'task',
    title: '任务更新',
    content: '"夏季饮料促销活动"已更新，请查看最新要求。',
    time: '2026-06-09 17:30:00',
    read: true
  }
];
