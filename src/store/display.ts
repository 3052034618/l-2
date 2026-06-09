import { create } from 'zustand';
import { DisplayRecord } from '@/types';
import { shelfList, displayRecords, checkItems } from '@/data/display';

interface DisplayState {
  shelves: {
    id: string;
    name: string;
    category: string;
    status: 'checked' | 'pending' | 'abnormal';
    lastCheck: string;
  }[];
  records: DisplayRecord[];
  checkItems: { id: string; name: string; required: boolean }[];

  addRecord: (record: Omit<DisplayRecord, 'id' | 'createTime'>) => void;
  updateShelfStatus: (shelfId: string, status: 'checked' | 'abnormal') => void;
}

export const useDisplayStore = create<DisplayState>((set) => ({
  shelves: shelfList,
  records: displayRecords,
  checkItems: checkItems,

  addRecord: (record) => {
    console.log('[DisplayStore] 添加陈列记录:', record);
    const newRecord: DisplayRecord = {
      ...record,
      id: `record_${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    };

    set(state => ({
      records: [newRecord, ...state.records]
    }));
  },

  updateShelfStatus: (shelfId, status) => {
    console.log('[DisplayStore] 更新货架状态:', shelfId, status);
    set(state => ({
      shelves: state.shelves.map(s =>
        s.id === shelfId
          ? {
              ...s,
              status,
              lastCheck: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
            }
          : s
      )
    }));
  }
}));
